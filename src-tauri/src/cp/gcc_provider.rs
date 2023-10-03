use std::{path::PathBuf, process::Stdio, time::Duration};

use futures_util::TryFutureExt;
use log::info;
use tokio::{
    fs::File,
    io::{AsyncReadExt, BufReader},
    process::Command,
    time::timeout,
};

use super::{CheckerStatus, CompilerCaller, ExecuatorCaller, LanguageProvider};

pub struct GccCompiler;
#[async_trait::async_trait]
impl CompilerCaller for GccCompiler {
    fn ext(&self) -> &'static str {
        "cpp"
    }

    async fn compile_file(
        &self,
        path: &str,
        args: Vec<String>,
        output: &str,
    ) -> Result<(), String> {
        let mut proc = tokio::process::Command::new("g++")
            .arg(path)
            .args(["-o", output])
            .args(&args)
            .stderr(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;
        let mut err_msg = String::new();
        let mut reader = BufReader::new(proc.stderr.take().unwrap());
        reader.read_to_string(&mut err_msg).await.unwrap();
        let exit_status = proc.wait().map_err(|e| e.to_string()).await?;
        if exit_status.success() {
            Ok(())
        } else {
            Err(err_msg)
        }
    }
}

pub struct ExeExecuator;

#[async_trait::async_trait]
impl ExecuatorCaller for ExeExecuator {
    #[cfg(target_os = "windows")]
    fn run_detached(&self, prov_run_prog: &str, target: &str) {
        std::process::Command::new("cmd")
            .args(["/C", "start", prov_run_prog, target])
            .spawn()
            .unwrap();
    }
    async fn run(
        &self,
        target: &str,
        input_from: &str,
        output_to: &str,
        time_limits: u64,
    ) -> Result<(), (CheckerStatus, String)> {
        let oup = PathBuf::from(output_to);
        let inp = File::open(PathBuf::from(input_from)).await.unwrap();
        if oup.exists() {
            tokio::fs::remove_file(&oup)
                .await
                .map_err(|e| (CheckerStatus::UKE, e.to_string()))?;
        }
        let oup = File::create(oup)
            .await
            .map_err(|e| (CheckerStatus::UKE, e.to_string()))?;

        let mut proc = tokio::process::Command::new(target)
            .stdin(Stdio::from(inp.into_std().await))
            .stdout(Stdio::from(oup.into_std().await))
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| (CheckerStatus::UKE, e.to_string()))?;

        let mut err_msg = String::new();

        let timeout_res =
            tokio::time::timeout(Duration::from_millis(time_limits), proc.wait()).await;

        let mut reader = BufReader::new(proc.stderr.take().unwrap());

        if timeout_res.is_err() {
            if cfg!(windows) {
                let taskkill = Command::new("cmd.exe")
                    .args([
                        "/C",
                        "taskkill",
                        "/F",
                        "/PID",
                        &proc.id().unwrap().to_string(),
                    ])
                    .spawn()
                    .unwrap();
                info!("{:?}", taskkill.wait_with_output().await);
                let _ = proc.wait().await;
            } else {
                proc.kill().await.unwrap();
            }
            return Err((CheckerStatus::TLE, String::new()));
        }
        reader
            .read_to_string(&mut err_msg)
            .await
            .map_err(|e| (CheckerStatus::RE, e.to_string()))?;

        match timeout_res.unwrap() {
            Ok(exit_code) => {
                if exit_code.success() {
                    return Ok(());
                } else {
                    return Err((CheckerStatus::RE, String::new()));
                }
            }
            Err(err) => {
                return Err((CheckerStatus::UKE, err.to_string()));
            }
        }
    }
}

pub struct GccProvider;
impl LanguageProvider for GccProvider {
    fn generator(&self) -> Box<dyn ExecuatorCaller> {
        Box::new(ExeExecuator)
    }

    fn compiler(&self) -> Box<dyn CompilerCaller> {
        Box::new(GccCompiler)
    }

    fn executaor(&self) -> Box<dyn ExecuatorCaller> {
        Box::new(ExeExecuator)
    }

    fn checker(&self) -> Box<dyn super::CheckerCaller> {
        todo!()
    }

    fn validator(&self) -> Box<dyn super::CheckerCaller> {
        todo!()
    }
}
