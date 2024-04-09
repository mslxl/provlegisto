// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{env, path::PathBuf};

use ipc::{
    cmd::{bind::LSPState, competitive_companion::CompetitiveCompanionState},
    rt::{checker::CheckerState, compiler::CompilerState, runner::RunnerState},
    setup::installer::PwshScriptState,
};
use log::LevelFilter;
use once_cell::sync::OnceCell;
use tauri::{plugin::TauriPlugin, Manager, Runtime};
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, LogTarget};

pub mod ipc;
pub mod util;

pub static CONFIG_DIR: OnceCell<PathBuf> = OnceCell::new();
pub static RESOURCE_DIR: OnceCell<PathBuf> = OnceCell::new();

fn log_pugin<R: Runtime>() -> TauriPlugin<R> {
    let builder = tauri_plugin_log::Builder::default()
        .targets([LogTarget::Stdout, LogTarget::Webview, LogTarget::LogDir])
        .with_colors(ColoredLevelConfig::default())
        .max_file_size(10240);
    let builder = if cfg!(debug_assertions) {
        builder.level(LevelFilter::Debug)
    } else {
        builder.level(LevelFilter::Warn)
    };
    builder.build()
}

#[tauri::command]
async fn is_debug() -> Result<bool, String> {
    Ok(cfg!(debug_assertions))
}

#[tauri::command]
async fn get_settings_path() -> Result<String, String> {
    Ok(String::from("settings.dat"))
}

fn main() {
    tauri::Builder::default()
        .plugin(log_pugin())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_websocket::init())
        .setup(|app| {
            // provlegisto state
            CONFIG_DIR
                .set(util::fs::canonicalize(app.path_resolver().app_config_dir().unwrap()).unwrap())
                .unwrap();
            RESOURCE_DIR
                .set(
                    util::fs::canonicalize(app.path_resolver().app_local_data_dir().unwrap()).unwrap(),
                )
                .unwrap();
            app.manage(LSPState::default());
            app.manage(CompetitiveCompanionState::default());
            app.manage(CompilerState::default());
            app.manage(RunnerState::default());
            app.manage(CheckerState::default());
            app.manage(PwshScriptState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            is_debug,
            get_settings_path,
            ipc::cmd::bind::get_lsp_server,
            ipc::cmd::bind::open_devtools,
            ipc::cmd::competitive_companion::enable_competitive_companion,
            ipc::cmd::competitive_companion::disable_competitive_companion,
            ipc::cmd::host::get_hostname,
            ipc::cmd::host::get_system_name,
            ipc::setup::capture_output,
            ipc::setup::which,
            ipc::setup::installer::execuate_pwsh_script,
            ipc::rt::compiler::compile_source,
            ipc::rt::runner::run_detach,
            ipc::rt::runner::run_redirect,
            ipc::rt::checker::abort_all_checker,
            ipc::rt::checker::check_answer,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
