// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lsp::LSPState;
use tauri::Manager;

mod lsp;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(LSPState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![lsp::switch_lsp_adapter])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
