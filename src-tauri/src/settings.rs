use std::sync::Mutex;

use once_cell::sync::Lazy;
use tauri::Runtime;
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

#[tauri::command]
pub async fn set_presist_settings<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
    value: String,
) -> Result<(), String> {
    let path =
        tauri::utils::platform::resource_dir(app.package_info(), &tauri::Env::default()).unwrap();
    let dst = path.join(name);
    update_global_settings(&value).await;
    tokio::fs::write(dst, value.as_bytes()).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn get_presist_settings<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
) -> Result<Option<String>, String> {
    let path =
        tauri::utils::platform::resource_dir(app.package_info(), &tauri::Env::default()).unwrap();
    let dst = path.join(name);
    let value = tokio::fs::read_to_string(dst).await.ok();
    if let Some(ref config) = value {
        update_global_settings(&config).await;
    }
    Ok(value)
}
