// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::exit;

use net::RemoteState;
use tauri_plugin_log::LogTarget;

use lsp::LSPState;
use tauri::Manager;
use tempfile::TempDir;

mod cp;
mod lsp;
mod net;
mod presist;

pub struct AppCache {
    cache_dir: TempDir,
}
impl Default for AppCache {
    fn default() -> Self {
        let cache_dir = tempfile::tempdir().unwrap();
        Self { cache_dir }
    }
}
#[tauri::command]
async fn save_to_tempfile(
    cache: tauri::State<'_, AppCache>,
    content: &str,
    ext: &str,
) -> Result<String, String> {
    let name = sha256::digest(content);
    let path = cache.cache_dir.path().join(format!("{}.{}", name, ext));
    tokio::fs::write(&path, content)
        .await
        .map_err(|e| e.to_string())?;

    Ok(path.to_str().unwrap().to_owned())
}

#[tauri::command]
async fn new_tempfile(cache: tauri::State<'_, AppCache>) -> Result<String, String> {
    let file =
        tempfile::NamedTempFile::new_in(cache.cache_dir.path()).map_err(|e| e.to_string())?;
    let (_, path) = file.keep().unwrap();
    tokio::fs::write(&path, "")
        .await
        .map_err(|e| e.to_string())?;
    Ok(path.to_str().unwrap().to_owned())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(LSPState::default());
            app.manage(RemoteState::default());
            app.manage(AppCache::default());
            Ok(())
        })
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            lsp::enable_lsp_adapter,
            presist::get_presist_item,
            presist::set_presist_item,
            cp::cp_compile_src,
            cp::cp_run_detached_src,
            cp::cp_compile_run_src,
            save_to_tempfile,
            new_tempfile
        ])
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { .. } => {
                if event.window().label() == "main" {
                    exit(0)
                }
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
