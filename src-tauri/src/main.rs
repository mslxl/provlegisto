// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::process::exit;

use cp::CompileCache;
use net::RemoteState;
use tauri_plugin_log::LogTarget;

use lsp::LSPState;
use tauri::Manager;

mod cp;
mod lsp;
mod net;
mod presist;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(LSPState::default());
            app.manage(RemoteState::default());
            app.manage(CompileCache::default());
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
