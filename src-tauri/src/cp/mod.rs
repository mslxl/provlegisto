mod gcc_provider;

use std::path::PathBuf;

use log::info;
use tempfile::{tempdir, TempDir};

use crate::net::RemoteState;

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserSourceFile {
    lang: String,
    filename: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct UserSourceCode {
    lang: String,
    src: String,
}

pub struct CompileCache {
    cache_dir: TempDir,
}
impl Default for CompileCache {
    fn default() -> Self {
        let cache_dir = tempfile::tempdir().unwrap();
        Self { cache_dir }
    }
}

#[async_trait::async_trait]
pub trait CompilerCaller: Sync + Send {
    fn ext(&self) -> &'static str;
    async fn compile_file(&self, path: &str, args: Vec<String>, output: &str)
        -> Result<(), String>;
    async fn compile_code(
        &self,
        code: &str,
        args: Vec<String>,
        output: &str,
    ) -> Result<(), String> {
        let tmp_dir = tempdir().unwrap();
        let code_file = tmp_dir.path().join(format!("code.{}", self.ext()));
        tokio::fs::write(&code_file, code)
            .await
            .map_err(|e| e.to_string())?;
        self.compile_file(code_file.to_str().unwrap(), args, output)
            .await
    }
}

#[async_trait::async_trait]
pub trait ExecuatorCaller: Sync + Send {
    fn run_detached(&self, target: &str);
    async fn run(&self, target: &str, input_from: &str, output_to: &str) -> Result<String, String>;
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub enum CheckerStatus {
    AC,
    WA,
    RE,
    TLE,
    MLE,
    UKE,
}

pub trait CheckerCaller: Sync + Send {
    fn check(
        &self,
        actual_output_file: &str,
        expect_output_file: &str,
    ) -> Result<CheckerStatus, String>;
}

pub trait LanguageProvider: Sync + Send {
    fn generator(&self) -> Box<dyn ExecuatorCaller>;
    fn compiler(&self) -> Box<dyn CompilerCaller>;
    fn executaor(&self) -> Box<dyn ExecuatorCaller>;
    fn checker(&self) -> Box<dyn CheckerCaller>;
    fn validator(&self) -> Box<dyn CheckerCaller>;
}

pub struct LanguageRegister;

unsafe impl Send for LanguageRegister {}
unsafe impl Sync for LanguageRegister {}

impl LanguageRegister {
    fn get(&self, name: &str) -> Option<Box<dyn LanguageProvider>> {
        match name.to_lowercase().as_str() {
            "gcc" | "g++" | "cpp" => Some(Box::new(gcc_provider::GccProvider)),
            _ => None,
        }
    }
}

#[tauri::command]
pub async fn cp_compile_src(
    _state: tauri::State<'_, RemoteState>,
    cache: tauri::State<'_, CompileCache>,
    src: UserSourceCode,
    compile_args: Vec<String>,
) -> Result<String, String> {
    // 获取需要的编译器
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    // 通过内容计算文件名
    let hash = sha256::digest(&src.src);
    let src_file = cache
        .cache_dir
        .path()
        .join(format!("{}.{}", hash, provider.compiler().ext()));
    let src_filename = src_file.to_str().to_owned().unwrap();
    let target_file = cache.cache_dir.path().join(format!("{}.exe", hash));
    let target_filename = target_file.to_str().to_owned().unwrap();

    if !target_file.exists() {
        // 文件不存在则编译
        tokio::fs::write(&src_file, &src.src)
            .await
            .map_err(|e| e.to_string())?;
        provider
            .compiler()
            .compile_file(src_filename, compile_args, target_filename)
            .await?;
    }
    info!("compile {} to {}", &src_filename, &target_filename);

    Ok(target_filename.to_owned())
}

#[tauri::command]
pub async fn cp_run_detached_src(
    state: tauri::State<'_, RemoteState>,
    cache: tauri::State<'_, CompileCache>,
    src: UserSourceCode,
    compile_args: Vec<String>,
) -> Result<(), String> {
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    let exe = cp_compile_src(state, cache, src, compile_args).await?;
    provider.executaor().run_detached(&exe);
    Ok(())
}

#[tauri::command]
pub async fn cp_compile_run_src(
    state: tauri::State<'_, RemoteState>,
    cache: tauri::State<'_, CompileCache>,
    src: UserSourceCode,
    compile_args: Vec<String>,
    input_from: &str,
    output_to: &str,
) -> Result<String, String> {
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    let exe = cp_compile_src(state, cache, src, compile_args).await?;
    provider.executaor().run(&exe, input_from, output_to).await
}
