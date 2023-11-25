// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ipc::{
    cmd::{bind::LSPState, competitive_companion::CompetitiveCompanionState},
    rt::{compiler::CompilerState, runner::RunnerState, checker::CheckerState},
};
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
            app.manage(CompetitiveCompanionState::default());
            app.manage(CompilerState::default());
            app.manage(RunnerState::default());
            app.manage(CheckerState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ipc::cmd::bind::get_lsp_server,
            ipc::cmd::bind::open_devtools,
            ipc::cmd::competitive_companion::enable_competitive_companion,
            ipc::cmd::competitive_companion::disable_competitive_companion,
            ipc::rt::compiler::compile_source,
            ipc::rt::runner::run_detach,
            ipc::rt::runner::run_redirect,
            ipc::rt::checker::abort_all_checker,
            ipc::rt::checker::check_answer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
