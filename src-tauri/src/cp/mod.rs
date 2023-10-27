pub mod cmd;
mod gcc_provider;

use tempfile::tempdir;

use crate::{settings::Settings, AppCache};

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
        settings: &Settings,
        app_cache: &AppCache,
        path: &str,
    ) -> Result<String, String>;
    async fn compile_code(
        &self,
        settings: &Settings,
        app_cache: &AppCache,
        code: &str,
    ) -> Result<String, String> {
        let tmp_dir = tempdir().unwrap();
        let code_file = tmp_dir.path().join(format!("code.{}", self.ext()));
        tokio::fs::write(&code_file, code)
            .await
            .map_err(|e| e.to_string())?;
        self.compile_file(settings, app_cache, code_file.to_str().unwrap())
            .await
    }
}

#[async_trait::async_trait]
pub trait ExecuatorCaller: Sync + Send {
    fn run_detached(&self, settings: &Settings, prov_run_prog: &str, target: &str);
    async fn run(
        &self,
        settings: &Settings,
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
