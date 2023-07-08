
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, sync::Arc};

use once_cell::sync::Lazy;

mod vfs;
mod net;

mod settings;

pub struct Args{
    userDir: PathBuf 
}
impl Default for Args{
    fn default() -> Self {
        Self { userDir: std::env::current_dir().unwrap().join("data") }
    }
}
 

pub static ARGS: Lazy<Arc<Args>> = Lazy::new(|| Arc::new(Args::default()));

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            settings::get_setting_item,
            settings::set_setting_item,
            settings::rm_setting_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
