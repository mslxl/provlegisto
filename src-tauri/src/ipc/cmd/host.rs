#[tauri::command]
pub async fn get_hostname() -> Result<String, String> {
    let name = gethostname::gethostname()
        .to_string_lossy()
        .as_ref()
        .to_owned();
    Ok(name)
}

#[tauri::command]
pub async fn get_system_name() -> Result<String, String> {
    Ok(std::env::consts::OS.to_owned())
}
