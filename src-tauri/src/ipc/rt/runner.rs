use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::{ExitStatus, Stdio};
use std::task::Context;
use std::time::Duration;
use tauri::Runtime;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::mpsc::{self, UnboundedReceiver};

use crate::{
    ipc::LanguageMode,
    util::{
        console::{create_new_console, hide_new_console},
        keylock::KeyLock,
    },
};

#[tauri::command]
pub async fn run_detach<R: Runtime>(
    app: tauri::AppHandle<R>,
    target: String,
    args: Vec<String>,
) -> Result<(), String> {
    let pauser = if cfg!(windows) {
        app.path_resolver().resolve_resource("consolepauser.exe")
    } else {
        app.path_resolver().resolve_resource("consolepauser")
    }
    .unwrap();
    let mut cmd = std::process::Command::new(pauser);
    cmd.arg("1").arg(target).args(args);
    create_new_console(&mut cmd);
    cmd.spawn().map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(tag = "type")]
enum RunnerOutputCommand {
    Clear,
    AppendStdout { line: String },
    AppendStderr { line: String },
}
pub struct RunnerOutputUpdater<R: Runtime> {
    task_id: String,
    win: tauri::Window<R>,
}
impl<R: Runtime> RunnerOutputUpdater<R> {
    fn clear(&self) {
        self.win
            .emit(&self.task_id, RunnerOutputCommand::Clear)
            .unwrap();
    }
    fn append_stdout(&self, msg: String) {
        self.win
            .emit(
                &self.task_id,
                RunnerOutputCommand::AppendStdout { line: msg },
            )
            .unwrap();
    }

    fn append_stderr(&self, msg: String) {
        self.win
            .emit(
                &self.task_id,
                RunnerOutputCommand::AppendStderr { line: msg },
            )
            .unwrap();
    }
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum RunResult {
    PASS {
        output_file: String,
        error_file: String,
    },
    RE {
        exit_code: i32,
        output_file: String,
        error_file: String,
    },
    TLE,
}

#[derive(Default)]
pub struct RunnerState {
    lock: KeyLock<String>,
}

#[tauri::command]
pub async fn run_redirect<R: Runtime>(
    window: tauri::Window<R>,
    state: tauri::State<'_, RunnerState>,
    mode: LanguageMode,
    task_id: String,
    exec_target: String,
    input: String,
    timeout: u64,
    addition_args: Vec<String>,
) -> Result<RunResult, String> {
    // todo options
    assert_eq!(addition_args.len(), 0);
    let _lock = state
        .lock
        .try_lock(task_id.clone())
        .await
        .map_err(|e| e.to_string())?;
    let workspace = {
        let target = PathBuf::from(&exec_target);
        target.parent().unwrap().to_owned()
    };

    let cmd = match mode {
        LanguageMode::CXX => std::process::Command::new(exec_target),
        _ => unimplemented!(),
    };
    let update = RunnerOutputUpdater {
        task_id: task_id.clone(),
        win: window,
    };

    let job = run_command_with_updater(update, cmd, input);
    let timeout = tokio::time::timeout(Duration::from_millis(timeout), job).await;
    let result = if let Ok(status) = timeout {
        let (exit_status, stdout, stderr) = status.map_err(|e| e.to_string())?;
        let stdout_log = workspace.join(format!("task{}-stdout.log", &task_id));
        let stderr_log = workspace.join(format!("task{}-stderr.log", &task_id));
        tokio::fs::write(&stdout_log, &stdout)
            .await
            .map_err(|e| e.to_string())?;
        tokio::fs::write(&stderr_log, &stderr)
            .await
            .map_err(|e| e.to_string())?;
        let stdout_log = dunce::canonicalize(stdout_log)
            .map_err(|e| e.to_string())?
            .to_str()
            .unwrap()
            .to_owned();
        let stderr_log = dunce::canonicalize(stderr_log)
            .map_err(|e| e.to_string())?
            .to_str()
            .unwrap()
            .to_owned();
        if exit_status.success() {
            RunResult::PASS {
                output_file: stdout_log,
                error_file: stderr_log,
            }
        } else {
            RunResult::RE {
                exit_code: exit_status.code().unwrap_or(0),
                output_file: stdout_log,
                error_file: stderr_log,
            }
        }
    } else {
        RunResult::TLE
    };
    Ok(result)
}

struct ChildKiller(Child);
impl AsMut<Child> for ChildKiller {
    fn as_mut(&mut self) -> &mut Child {
        &mut self.0
    }
}
impl AsRef<Child> for ChildKiller {
    fn as_ref(&self) -> &Child {
        &self.0
    }
}
impl Drop for ChildKiller {
    fn drop(&mut self) {
        if let Ok(None) = self.0.try_wait() {
            log::info!(
                "process was timeout and the handle was dropped, kill pid {}",
                self.0.id().unwrap()
            );
            self.0.start_kill().unwrap();
        }
    }
}

async fn run_command_with_updater<R: Runtime>(
    update: RunnerOutputUpdater<R>,
    mut cmd: std::process::Command,
    input: String,
) -> Result<(ExitStatus, String, String)> {
    cmd.stderr(Stdio::piped())
        .stdout(Stdio::piped())
        .stdin(Stdio::piped());
    hide_new_console(&mut cmd);
    let mut cmd = Command::from(cmd);
    let mut proc = ChildKiller(cmd.spawn()?);

    let mut stdin = proc.0.stdin.take().unwrap();
    stdin.write_all(input.as_bytes()).await?;
    stdin.flush().await?;
    std::mem::drop(stdin); // close stdin
    let mut stdout = BufReader::new(proc.0.stdout.take().unwrap());
    let mut stderr = BufReader::new(proc.0.stderr.take().unwrap());

    let mut stdout_buf = String::new();
    let mut stderr_buf = String::new();
    let mut stdout_eof = false;
    let mut stderr_eof = false;
    update.clear();

    let exit_status = loop {
        let mut stdout_bytesbuf = Vec::new();
        let mut stderr_bytesbuf = Vec::new();
        tokio::select! {
            Ok(sz) = stdout.read_until(b'\n', &mut stdout_bytesbuf), if !stdout_eof => {
                if sz == 0{
                    stdout_eof = true;
                    continue;
                }
                let buf = String::from_utf8(stdout_bytesbuf)?;
                stdout_buf.push_str(&buf);
                update.append_stdout(buf);
            }
            Ok(sz) = stderr.read_until(b'\n', &mut stderr_bytesbuf), if !stderr_eof => {
                if sz == 0 {
                    stderr_eof = true;
                    continue;
                }
                let buf = String::from_utf8(stderr_bytesbuf)?;
                stderr_buf.push_str(&buf);
                update.append_stderr(buf);
            }
            else => {
                break proc.as_mut().wait().await?;
            }
        }
    };

    Ok((exit_status, stdout_buf, stderr_buf))
}
