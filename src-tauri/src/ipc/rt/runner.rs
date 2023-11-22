use std::process::Command;

use anyhow::Result;
use tauri::Runtime;

use crate::util::console::create_new_console;

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
    let mut cmd = Command::new(pauser);
    cmd.arg("1").arg(target).args(args);
    create_new_console(&mut cmd);
    cmd.spawn().map_err(|e| e.to_string())?;

    Ok(())
}
