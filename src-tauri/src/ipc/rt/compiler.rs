use async_trait::async_trait;
use std::{collections::HashMap, env, path::PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;

use crate::{ipc::LanguageMode, util::keylock::KeyLock};

use super::gnu_gcc::GNUGccCompiler;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileLint {
    pub position: Option<(i32, i32)>,
    pub ty: Option<String>,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CompileResult {
    Success { data: String },
    Error { data: Vec<CompileLint> },
}

#[async_trait]
pub trait Compiler: Sync + Send {
    async fn compile(
        &self,
        source: String,
        compiler_options: CompilerOptions,
        working_path: PathBuf,
    ) -> Result<CompileResult>;
}

#[derive(Default)]
pub struct CompilerState {
    lock: KeyLock<String>,
    cache: RwLock<HashMap<String, PathBuf>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompilerOptions {
    pub path: Option<String>,
    pub args: Option<Vec<String>>,
}

#[tauri::command]
pub async fn compile_source(
    state: tauri::State<'_, CompilerState>,
    mode: LanguageMode,
    source: String,
    compiler_options: CompilerOptions,
    suggest_output_path: Option<String>,
) -> Result<CompileResult, String> {
    let hash = sha256::digest(&source);

    let compile_lock = state.lock.lock(hash.clone()).await;

    // lookup cache
    let read_guard = state.cache.read().await;
    if let Some(path) = read_guard.get(&hash) {
        if path.exists() {
            let last_result = dunce::canonicalize(path)
                .map_err(|e| e.to_string())?
                .to_str()
                .unwrap()
                .to_owned();
            return Ok(CompileResult::Success { data: last_result });
        }
    }
    std::mem::drop(read_guard);

    let target_path = if let Some(path) = suggest_output_path {
        PathBuf::from(path)
    } else {
        env::temp_dir().join(format!("prov{}", &hash[0..16]))
    };
    if !target_path.exists() {
        tokio::fs::create_dir_all(&target_path)
            .await
            .map_err(|e| e.to_string())?;
    }

    let compiler_handle: Box<dyn Compiler> = match mode {
        LanguageMode::CXX => Box::new(GNUGccCompiler),
        LanguageMode::PY => unimplemented!(),
    };

    let result = compiler_handle
        .compile(source, compiler_options, target_path)
        .await
        .map_err(|e| e.to_string())?;

    if let CompileResult::Success { data: result_path } = &result {
        let mut write_guard = state.cache.write().await;
        write_guard.insert(hash, PathBuf::from(result_path));
    }
    std::mem::drop(compile_lock);
    Ok(result)
}
