use std::process::{Command, Stdio};

use tauri::Runtime;
use tokio::{
    io::{AsyncBufReadExt, BufReader},
    sync::Mutex,
};

use crate::{util::console, RESOURCE_DIR};

#[derive(Default)]
pub struct PwshScriptState {
    s: Mutex<()>,
}

#[tauri::command]
pub async fn execuate_pwsh_script<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    state: tauri::State<'_, PwshScriptState>,
    name: String,
) -> Result<String, String> {
    if !cfg!(windows) {
        return Err(String::from("Installer only work on windows"));
    }
    let _guard = state.s.lock().await;

    let script_file = app
        .path_resolver()
        .resolve_resource(format!("sidecar/{}.ps1", &name))
        .unwrap();
    let script_file = dunce::canonicalize(script_file).unwrap();
    log::info!("execuate script {:?}", &script_file.to_str());
    let mut cmd = Command::new(which::which("powershell").unwrap());

    let target = RESOURCE_DIR.get().unwrap();
    cmd.args(["-ExecutionPolicy", "Bypass"]);
    cmd.args(["-File", &script_file.to_str().unwrap()]);
    cmd.arg(target.to_str().unwrap().replace(" ", "` "));
    console::hide_new_console(&mut cmd);

    let mut cmd = tokio::process::Command::from(cmd);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());
    cmd.stdin(Stdio::piped());
    let mut proc = cmd.spawn().unwrap();
    let mut stdout = BufReader::new(
        proc.stdout
            .take()
            .ok_or(String::from("Fail to open stdout"))?,
    )
    .lines();
    let mut stderr = BufReader::new(
        proc.stderr
            .take()
            .ok_or(String::from("Fail to open stderr"))?,
    )
    .lines();

    let mut stdout_eof = false;
    let mut stderr_eof = false;
    let result = loop {
        tokio::select! {
                Ok(data) = stdout.next_line(), if !stdout_eof => {
                    if let Some(line) = data {
                      window.emit("install_message", line).map_err(|e| e.to_string())?;
                    }else{
                        stdout_eof = true
                    }
                }
                Ok(data) = stderr.next_line(), if !stderr_eof => {
                    if let Some(line) = data{
                      window.emit("install_message", line).map_err(|e| e.to_string())?;
                    }else{
                        stderr_eof = true;
                    }
                }
                else => {
                    break proc.wait().await.map_err(|e|e.to_string())?;
                }
        }
    };

    if result.success() {
        let report = target.join(format!("{}.json", name));
        let content = tokio::fs::read_to_string(report)
            .await
            .map_err(|e| e.to_string())?;
        Ok(content)
    } else {
        if let Some(code) = result.code() {
            Err(format!("Process exit with code {}", code))
        } else {
            Err(String::from("Process exit with terminal signal"))
        }
    }
}
