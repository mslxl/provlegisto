// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ipc::cmd::bind::LSPState;
use tauri::Manager;
use util::logger::SimpleLogger;

pub mod ipc;
pub mod util;

static LOGGER: SimpleLogger = SimpleLogger;
fn main() {
    let _ = log::set_logger(&LOGGER).map(|()| log::set_max_level(log::LevelFilter::Info));

    tauri::Builder::default()
        .setup(|app| {
            app.manage(LSPState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ipc::cmd::bind::bind_ws_ipc,
            ipc::cmd::bind::get_lsp_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
