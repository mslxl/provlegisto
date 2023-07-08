use std::{fmt::Display, ops::Not, path::PathBuf};

use tokio::fs;

use crate::ARGS;

async fn get_setting_file_path(name: &str) -> Result<PathBuf, anyhow::Error> {
    let mut path = ARGS.userDir.join(name);
    path.set_extension("json");
    dbg!(&path);
    if !&path.exists() {
        let parent = &path.parent().unwrap();
        if !parent.exists() {
            fs::create_dir_all(parent).await?;
        }
    }
    Ok(path)
}

fn e2s<T: Display>(v: T) -> String {
    format!("{}", v)
}

#[tauri::command]
pub async fn set_setting_item(name: &str, value: &str) -> Result<(), String> {
    let path = get_setting_file_path(name).await.map_err(e2s)?;
    fs::write(path, value).await.map_err(e2s)?;
    Ok(())
}

#[tauri::command]
pub async fn rm_setting_item(name: &str) -> Result<(), String> {
    let path = get_setting_file_path(name).await.map_err(e2s)?;
    if path.exists() {
        fs::remove_file(path).await.map_err(e2s)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn get_setting_item(name: &str) -> Result<Option<String>, String> {
    let path = get_setting_file_path(name).await.map_err(e2s)?;
    if path.exists() {
        let content = fs::read_to_string(path).await.map_err(e2s)?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}
