mod gcc_provider;

use std::{path::PathBuf, process::Stdio, time::Duration};

use log::info;
use tauri::Runtime;
use tempfile::tempdir;
use tokio::process::Command;

use crate::{winproc_flag, AppCache};

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

#[async_trait::async_trait]
pub trait CompilerCaller: Sync + Send {
    fn ext(&self) -> &'static str;
    /// Return compile output file if success
    /// Or return error message if failed
    async fn compile_file(
        &self,
        app_cache: &AppCache,
        path: &str,
        args: Vec<String>,
    ) -> Result<String, String>;
    async fn compile_code(
        &self,
        app_cache: &AppCache,
        code: &str,
        args: Vec<String>,
    ) -> Result<String, String> {
        let tmp_dir = tempdir().unwrap();
        let code_file = tmp_dir.path().join(format!("code.{}", self.ext()));
        tokio::fs::write(&code_file, code)
            .await
            .map_err(|e| e.to_string())?;
        self.compile_file(app_cache, code_file.to_str().unwrap(), args)
            .await
    }
}

#[async_trait::async_trait]
pub trait ExecuatorCaller: Sync + Send {
    fn run_detached(&self, prov_run_prog: &str, target: &str);
    async fn run(
        &self,
        target: &str,
        input_from: &str,
        output_to: &str,
        time_limits: u64,
    ) -> Result<(), (ExecuatorStatus, String)>;
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub enum ExecuatorStatus {
    PASS,
    TLE,
    CE,
    RE,
    MLE,
    UKE,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ExecuatorMessage {
    status: ExecuatorStatus,
    message: String,
    output: Option<String>,
}
impl ExecuatorMessage {
    fn new(status: ExecuatorStatus, message: String, output_file: Option<String>) -> Self {
        Self {
            status,
            message,
            output: output_file,
        }
    }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub enum CheckerStatus {
    AC,
    WA,
    UKE,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct CheckerMessage {
    status: CheckerStatus,
    message: String,
}
impl CheckerMessage {
    fn new(status: CheckerStatus, message: String) -> Self {
        Self { status, message }
    }
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
    cache: tauri::State<'_, AppCache>,
    src: UserSourceCode,
    compile_args: Vec<String>,
) -> Result<String, String> {
    // 获取需要的编译器
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    // 通过内容计算文件名
    let hash = sha256::digest(&src.src);

    let src_file = cache.file_with_name(&format!("{}.{}", hash, provider.compiler().ext()));
    let src_filename = src_file.to_str().to_owned().unwrap();
    let target_file = cache.file_with_name(&format!("{}.exe", hash));
    let target_filename = target_file.to_str().to_owned().unwrap();

    if !target_file.exists() {
        // 文件不存在则编译
        tokio::fs::write(&src_file, &src.src)
            .await
            .map_err(|e| e.to_string())?;
        provider
            .compiler()
            .compile_file(&cache, src_filename, compile_args)
            .await?;
    }
    info!("compile {} to {}", &src_filename, &target_filename);

    Ok(target_filename.to_owned())
}

#[tauri::command]
pub async fn cp_run_detached_src<R: Runtime>(
    app: tauri::AppHandle<R>,
    cache: tauri::State<'_, AppCache>,
    src: UserSourceCode,
    compile_args: Vec<String>,
) -> Result<(), String> {
    let prov_run_prog = if cfg!(window) {
        app.path_resolver()
            .resolve_resource("bin/prov_console_run.exe")
    } else {
        app.path_resolver().resolve_resource("bin/prov_console_run")
    }
    .expect("failed to resolve bin/prov_console_run binary");

    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    let exe = cp_compile_src(cache, src, compile_args).await?;
    provider
        .executaor()
        .run_detached(prov_run_prog.to_str().unwrap(), &exe);
    Ok(())
}

/// Compile src and run with input_file
/// Return output filename if the program end in time
/// Or return error enum and error message if an error was throw
#[tauri::command]
pub async fn cp_compile_run_src(
    cache: tauri::State<'_, AppCache>,
    src: UserSourceCode,
    time_limits: Option<u64>,
    compile_args: Vec<String>,
    input_file: &str,
) -> Result<ExecuatorMessage, String> {
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| (String::from("Language is unsupported")))?;

    let output_pathbuf = cache.file(Some("out"));
    let output_file = output_pathbuf.to_str().unwrap().to_owned();

    let exe = cp_compile_src(cache, src, compile_args).await;
    if exe.is_err() {
        return Ok(ExecuatorMessage::new(
            ExecuatorStatus::CE,
            String::new(),
            None,
        ));
    }

    let time_limits = time_limits.unwrap_or(3000);

    let execuator_res = provider
        .executaor()
        .run(&exe.unwrap(), input_file, &output_file, time_limits)
        .await;
    if let Err(err) = execuator_res {
        Ok(ExecuatorMessage {
            status: err.0,
            message: err.1,
            output: None,
        })
    } else {
        Ok(ExecuatorMessage::new(
            ExecuatorStatus::PASS,
            String::new(),
            Some(output_file),
        ))
    }
}

#[tauri::command]
pub async fn cp_run_checker<R: Runtime>(
    app: tauri::AppHandle<R>,
    cache: tauri::State<'_, AppCache>,
    checker: String,
    input_file: String,
    output_file: String,
    answer_file: String,
) -> Result<CheckerMessage, String> {
    let checker = if checker.starts_with("res:") {
        let rel_path = format!("bin/{}.exe", &checker[4..]);
        app.path_resolver()
            .resolve_resource(rel_path)
            .expect("failed to resolve checker resource")
    } else {
        PathBuf::from(checker)
    };
    let report_file = cache.file(Some("report"));
    let mut proc = Command::new(checker)
        .args([
            &input_file,
            &output_file,
            &answer_file,
            report_file.to_str().unwrap(),
        ])
        .stderr(Stdio::null())
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(winproc_flag::CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| e.to_string())?;

    match tokio::time::timeout(Duration::from_millis(5000), proc.wait()).await {
        Err(_) => {
            let _ = proc.kill().await;
            return Ok(CheckerMessage::new(
                CheckerStatus::UKE,
                String::from("Checker timeout"),
            ));
        }
        Ok(status) => {
            let report = tokio::fs::read_to_string(report_file)
                .await
                .unwrap_or(String::new());
            let status = status.map_err(|e| e.to_string())?;
            if status.success() {
                Ok(CheckerMessage::new(CheckerStatus::AC, report))
            } else {
                Ok(CheckerMessage::new(CheckerStatus::WA, report))
            }
        }
    }
}
