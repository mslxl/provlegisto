use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{ExitStatus, Stdio};
use std::time::Duration;
use tauri::Runtime;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

use crate::{
    ipc::LanguageMode,
    util::{
        console::{create_new_console, hide_new_console},
        keylock::KeyLock,
    },
};

#[derive(Debug, Serialize, Deserialize)]
pub struct CompileDataStore {
    pub compile: String,
    pub source: String,
    pub compile_args: Vec<String>,
    pub required_env_running: Option<HashMap<String, String>>,
}
impl CompileDataStore {
    fn get_addition_path<P: AsRef<Path>>(src: P) -> PathBuf {
        let mut ext = src
            .as_ref()
            .extension()
            .map(|s| s.to_str().unwrap())
            .unwrap_or("")
            .to_owned();
        ext.push_str(".toml");
        src.as_ref().with_extension(ext)
    }

    pub async fn load<P: AsRef<Path>>(src: P) -> Result<Self> {
        let path = CompileDataStore::get_addition_path(src);
        let content = tokio::fs::read_to_string(path).await?;
        Ok(toml::from_str(&content)?)
    }

    pub async fn save<P: AsRef<Path>>(&self, src: P) -> Result<()> {
        let path = CompileDataStore::get_addition_path(src);
        let conetnt = toml::to_string(&self)?;
        tokio::fs::write(&path, conetnt).await?;
        Ok(())
    }

    pub fn with_env(&self, cmd: &mut std::process::Command) {
        if let Some(env) = &self.required_env_running {
            for (k, v) in env {
                cmd.env(k, v);
            }
        }
    }

    pub fn with_interpreter_command(&self, cmd: &mut std::process::Command) -> Result<()> {
        cmd.arg(&self.compile);
        cmd.arg(&self.source);
        cmd.args(&self.compile_args);

        Ok(())
    }
    pub fn as_interpreter_command(&self) -> std::process::Command {
        let mut cmd = std::process::Command::new(&self.compile);
        cmd.arg(&self.source);
        cmd.args(&self.compile_args);

        cmd
    }
}

#[tauri::command]
pub async fn run_detach<R: Runtime>(
    app: tauri::AppHandle<R>,
    mode: LanguageMode,
    target: String,
    args: Vec<String>,
) -> Result<(), String> {
    let pauser = if cfg!(windows) {
        app.path_resolver()
            .resolve_resource("sidecar/consolepauser.exe")
    } else {
        app.path_resolver()
            .resolve_resource("sidecar/consolepauser")
    }
    .unwrap();

    let mut cmd = std::process::Command::new(pauser);
    cmd.arg("1");
    create_new_console(&mut cmd);
    let compile_data = CompileDataStore::load(&target)
        .await
        .map_err(|e| e.to_string())?;
    match mode {
        LanguageMode::CXX => {
            cmd.arg(target);
        }
        LanguageMode::PY => {
            compile_data
                .with_interpreter_command(&mut cmd)
                .map_err(|e| e.to_string())?;
        }
    }
    compile_data.with_env(&mut cmd);

    cmd.args(&args);
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
    stdout: Mutex<String>,
    stderr: Mutex<String>,
}

impl<R: Runtime> RunnerOutputUpdater<R> {
    fn new(task_id: String, window: tauri::Window<R>) -> Self {
        Self {
            task_id,
            win: window,
            stdout: Mutex::new(String::new()),
            stderr: Mutex::new(String::new()),
        }
    }
    async fn clear(&self) {
        self.win
            .emit(&self.task_id, RunnerOutputCommand::Clear)
            .unwrap();
    }
    async fn append_stdout(&self, msg: String) {
        let mut guard = self.stdout.lock().await;
        guard.push_str(&msg);
    }

    async fn append_stderr(&self, msg: String) {
        let mut guard = self.stderr.lock().await;
        guard.push_str(&msg);
    }

    async fn flush(&self) {
        let mut guard = self.stdout.lock().await;
        if !guard.is_empty() {
            self.win
                .emit(
                    &self.task_id,
                    RunnerOutputCommand::AppendStdout {
                        line: guard.clone(),
                    },
                )
                .unwrap();
            guard.clear();
        }
        let mut guard = self.stderr.lock().await;
        if !guard.is_empty() {
            self.win
                .emit(
                    &self.task_id,
                    RunnerOutputCommand::AppendStderr {
                        line: guard.clone(),
                    },
                )
                .unwrap();
            guard.clear();
        }
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

    let working_dir = PathBuf::from(&exec_target).parent().unwrap().to_path_buf();
    let compile_data = CompileDataStore::load(PathBuf::from(&exec_target))
        .await
        .map_err(|e| e.to_string())?;
    let mut cmd = match mode {
        LanguageMode::CXX => std::process::Command::new(exec_target),
        LanguageMode::PY => compile_data.as_interpreter_command(),
    };
    compile_data.with_env(&mut cmd);

    cmd.current_dir(working_dir);
    let update = RunnerOutputUpdater::new(task_id.clone(), window);

    let job = run_command_with_updater(&update, cmd, input);
    let timeout = tokio::time::timeout(Duration::from_millis(timeout), job).await;
    update.flush().await;

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

pub struct ChildKiller(Child);
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
    update: &RunnerOutputUpdater<R>,
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
    let mut stdout = BufReader::new(proc.0.stdout.take().unwrap()).lines();
    let mut stderr = BufReader::new(proc.0.stderr.take().unwrap()).lines();

    let mut stdout_buf = String::new();
    let mut stderr_buf = String::new();
    let mut stdout_eof = false;
    let mut stderr_eof = false;
    update.clear().await;

    let exit_status = loop {
        tokio::select! {
            Ok(data) = stdout.next_line(), if !stdout_eof => {
                if let Some(line) = data {
                    if !stdout_buf.is_empty() {
                        stdout_buf.push('\n');
                        update.append_stdout(String::from("\n")).await;
                    }
                    stdout_buf.push_str(&line);
                    update.append_stdout(line).await;
                }else{
                    stdout_eof = true
                }
            }
            Ok(data) = stderr.next_line(), if !stderr_eof => {
                if let Some(line) = data{
                    if !stderr_buf.is_empty() {
                        stderr_buf.push('\n');
                        update.append_stderr(String::from("\n")).await;
                    }
                    stderr_buf.push_str(&line);
                    update.append_stderr(line).await;
                }else{
                    stderr_eof = true;
                }
            }
            _ = tokio::time::sleep(Duration::from_millis(500)), if !stdout_eof || !stderr_eof => {
                update.flush().await;
            }
            else => {
                update.flush().await;
                log::info!("wait process end,exit? {:?}", proc.as_mut().try_wait());
                break proc.as_mut().wait().await?;
            }
        }
    };

    Ok((exit_status, stdout_buf, stderr_buf))
}
