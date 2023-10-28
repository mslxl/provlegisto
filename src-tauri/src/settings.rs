use std::{path::PathBuf, sync::Mutex};

use once_cell::sync::Lazy;
use tauri::{api::path, Runtime};
use tokio::sync::RwLock;

#[derive(serde::Deserialize, Clone, Debug)]
pub struct Settings {
    #[serde(rename = "cxxCompilerArguments")]
    pub cxx_compiler_arguments: Vec<String>,
    #[serde(rename = "cxxCompilerProgram")]
    pub cxx_compiler_program: String,
    #[serde(rename = "clangdProgram")]
    pub clangd_program: String,

    #[serde(rename = "terminalProgram")]
    pub terminal_program: String,
    #[serde(rename = "terminalArguments")]
    pub terminal_arguments: Vec<String>,
}

pub static GLOBAL_SETTINGS: Lazy<RwLock<Option<Settings>>> = Lazy::new(|| RwLock::new(None));

async fn update_global_settings(config_text: &str) {
    if let Ok(settings) = serde_json::from_str(config_text) {
        let mut writer = GLOBAL_SETTINGS.write().await;
        println!("update settings: {:?}", &settings);
        *writer = Some(settings);
    }
}

fn home_config_resolver() -> PathBuf {
    wrap_suggest_config_dir(path::home_dir().unwrap(), Some(".provlegisto"))
}

fn wrap_suggest_config_dir(path_buf: PathBuf, name: Option<&str>) -> PathBuf {
    let dst = path_buf.join(name.unwrap_or("provlegisto"));
    if !dst.exists() {
        std::fs::create_dir_all(&dst).expect("failed to create config dir");
    }
    dst
}

#[tauri::command]
pub async fn set_presist_settings<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
    value: String,
) -> Result<(), String> {
    let path = app
        .path_resolver()
        .app_config_dir()
        .map(|p| wrap_suggest_config_dir(p, None))
        .unwrap_or_else(|| home_config_resolver());
    let dst = path.join(name);

    update_global_settings(&value).await;
    tokio::fs::write(dbg!(dst), value.as_bytes()).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn get_presist_settings<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
) -> Result<Option<String>, String> {
    let path = app
        .path_resolver()
        .app_config_dir()
        .map(|p| wrap_suggest_config_dir(p, None))
        .unwrap_or_else(|| home_config_resolver());
    let dst = path.join(name);

    let value = tokio::fs::read_to_string(dst).await.ok();
    if let Some(ref config) = value {
        update_global_settings(&config).await;
    }
    Ok(value)
}
