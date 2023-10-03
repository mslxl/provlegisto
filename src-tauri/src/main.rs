// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{env::temp_dir, fs, path::PathBuf, process::exit};

use net::RemoteState;
use rand::distributions::{Alphanumeric, DistString};

use tauri_plugin_log::LogTarget;

use lsp::LSPState;
use tauri::Manager;

mod cp;
mod lsp;
mod net;
mod presist;

pub struct AppCache {
    dir: PathBuf,
}
impl Default for AppCache {
    fn default() -> Self {
        let dir = temp_dir().join("provlegisto");
        if !dir.exists() {
            fs::create_dir_all(&dir).unwrap();
        }
        Self { dir: dir }
    }
}
impl AppCache {
    fn file(&self, ext: Option<&str>) -> PathBuf {
        let mut rand_str = Alphanumeric.sample_string(&mut rand::thread_rng(), 32);
        if let Some(ext) = ext {
            rand_str.push_str(&ext);
        }
        self.file_with_name(&rand_str)
    }
    fn file_with_name(&self, name: &str) -> PathBuf {
        self.dir.join(name)
    }
}

#[tauri::command]
async fn save_to_tempfile(
    cache: tauri::State<'_, AppCache>,
    content: &str,
    ext: &str,
) -> Result<String, String> {
    let name = sha256::digest(content);
    let path = cache.file_with_name(&format!("{}.{}", name, ext));
    tokio::fs::write(&path, content)
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
