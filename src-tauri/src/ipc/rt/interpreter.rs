use std::path::PathBuf;

use crate::ipc::rt::compiler::CompileLint;

use super::{
    compiler::{CompileResult, Compiler, CompilerOptions},
    runner::CompileDataStore,
};
use anyhow::{Ok, Result};
use async_trait::async_trait;
use tokio::fs;

// It just record its compiler into a config file, not compile it
// it always success
pub struct Interpreter {
    ext: String,
}
impl Interpreter {
    pub fn with_ext(ext: String) -> Self {
        Self { ext }
    }
}

#[async_trait]
impl Compiler for Interpreter {
    async fn compile(
        &self,
        source: String,
        compiler_options: CompilerOptions,
        working_path: PathBuf,
    ) -> Result<CompileResult> {
        let source_file = working_path.join(format!("source.{}", self.ext));
        let compiler = if let Some(compiler) = compiler_options.path {
            compiler
        } else {
            return Ok(CompileResult::Error {
                data: vec![CompileLint {
                    position: Some((0, 0)),
                    ty: Some(String::from("Error")),
                    description: String::from("An compiler or interpreter must be specificed"),
                }],
            });
        };
        let compiler_args = compiler_options.args.unwrap_or(vec![]);
        let store = CompileDataStore {
            compile: compiler,
            source: source_file.to_str().unwrap().to_owned(),
            compile_args: compiler_args,
            required_env_running: None,
        };
        fs::write(&source_file, source).await?;
        store.save(&source_file).await?;

        Ok(CompileResult::Success {
            data: source_file.to_str().unwrap().to_owned(),
        })
    }
}
