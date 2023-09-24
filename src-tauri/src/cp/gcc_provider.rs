use std::{path::PathBuf, process::Stdio};

use futures_util::TryFutureExt;
use tokio::{
    fs::File,
    io::{AsyncReadExt, BufReader},
};

use super::{CompilerCaller, ExecuatorCaller, LanguageProvider};

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
    async fn run(&self, target: &str, input_from: &str, output_to: &str) -> Result<String, String> {
        let oup = PathBuf::from(output_to);
        let inp = File::open(PathBuf::from(input_from)).await.unwrap();
        if oup.exists() {
            tokio::fs::remove_file(&oup)
                .await
                .map_err(|e| e.to_string())?;
        }
        let oup = File::create(oup).await.map_err(|e| e.to_string())?;

        let mut proc = tokio::process::Command::new(target)
            .stdin(Stdio::from(inp.into_std().await))
            .stdout(Stdio::from(oup.into_std().await))
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| e.to_string())?;

        let mut err_msg = String::new();
        let mut reader = BufReader::new(proc.stderr.take().unwrap());
        reader
            .read_to_string(&mut err_msg)
            .await
            .map_err(|e| e.to_string())?;
        proc.wait().map_err(|e| e.to_string()).await?;
        Ok(err_msg)
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
