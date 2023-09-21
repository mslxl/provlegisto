use std::env;

use tauri::Runtime;

#[tauri::command]
pub async fn set_presist_item<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
    value: String,
) -> Result<(), String> {
    let path =
        tauri::utils::platform::resource_dir(app.package_info(), &tauri::Env::default()).unwrap();
    let dst = path.join(name);
    tokio::fs::write(dst, value.as_bytes()).await.unwrap();
    Ok(())
}

#[tauri::command]
pub async fn get_presist_item<R: Runtime>(
    app: tauri::AppHandle<R>,
    _window: tauri::Window<R>,
    name: String,
) -> Result<Option<String>, String> {
    let path =
        tauri::utils::platform::resource_dir(app.package_info(), &tauri::Env::default()).unwrap();
    let dst = path.join(name);
    let value = tokio::fs::read_to_string(dst).await.ok();
    Ok(value)
}
