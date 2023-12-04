pub mod installer;

use std::{process::Stdio, time::Duration};

use serde::{Deserialize, Serialize};
use tokio::process::Command;

use crate::util::console;

#[tauri::command]
pub async fn which(name: String) -> Result<Option<String>, String> {
    Ok(which::which(name)
        .ok()
        .map(|p| p.to_str().unwrap().to_owned()))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OutputCapture {
    exit_code: i32,
    stdout: String,
    stderr: String,
}

#[tauri::command]
pub async fn capture_output(program: String, args: Vec<String>) -> Result<OutputCapture, String> {
    let program = which::which(program).map_err(|e| e.to_string())?;
    let mut command = std::process::Command::new(&program);
    command.args(&args);
    console::hide_new_console(&mut command);
    let mut command = Command::from(command);
    command.stderr(Stdio::inherit());
    command.stdout(Stdio::inherit());
    let output = tokio::time::timeout(Duration::from_secs(3), command.output())
        .await
        .map_err(|e| e.to_string())?
        .map_err(|e| e.to_string())?;
    log::info!("capture output of {:?} {:?} :{:?}", &program, &args, output);
    Ok(OutputCapture {
        exit_code: output.status.code().unwrap(),
        stdout: String::from_utf8_lossy(&output.stdout).as_ref().to_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).as_ref().to_owned(),
    })
}
