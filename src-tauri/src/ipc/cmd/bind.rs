use std::collections::HashMap;

use crate::ipc::{
    lsp::{
        clangd::ClangdCommandBuilder, forward_server::ForwardServer, pyrights::PylsCommandBuilder,
        LspServer,
    },
    LanguageMode,
};
use tauri::Runtime;
use tokio::sync::Mutex;

pub struct LSPState {
    t: Mutex<HashMap<(LanguageMode, Option<String>), (u16, Box<dyn LspServer>)>>,
}

impl Default for LSPState {
    fn default() -> Self {
        Self {
            t: Mutex::new(HashMap::default()),
        }
    }
}

#[tauri::command]
pub async fn get_lsp_server(
    state: tauri::State<'_, LSPState>,
    mode: LanguageMode,
    path: Option<String>,
) -> Result<u16, String> {
    let mut guard = state.t.lock().await;
    let key = (mode, path);
    log::info!("start language server by {:?}", &key);
    if !guard.contains_key(&key) {
        match key.0 {
            LanguageMode::CXX => {
                let mut server = ForwardServer::new(ClangdCommandBuilder(key.1.clone()));
                let port = server.start().await.map_err(|e| e.to_string())?;
                guard.insert(key.clone(), (port, Box::new(server)));
            }
            LanguageMode::PY => {
                let mut server = ForwardServer::new(PylsCommandBuilder(key.1.clone()));
                let port = server.start().await.map_err(|e| e.to_string())?;
                guard.insert(key.clone(), (port, Box::new(server)));
            }
        }
    }

    Ok(guard.get(&key).unwrap().0)
}

#[tauri::command]
pub async fn open_devtools<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    window.open_devtools();
    Ok(())
}
