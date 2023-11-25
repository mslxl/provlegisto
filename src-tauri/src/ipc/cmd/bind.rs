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
    t: Mutex<HashMap<LanguageMode, (u16, Box<dyn LspServer>)>>,
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
    lsp_state: tauri::State<'_, LSPState>,
    mode: LanguageMode,
) -> Result<u16, String> {
    let mut guard = lsp_state.t.lock().await;
    if !guard.contains_key(&mode) {
        match mode {
            LanguageMode::CXX => {
                let mut server = ForwardServer::new(ClangdCommandBuilder);
                let port = server.start().await.map_err(|e| e.to_string())?;
                guard.insert(LanguageMode::CXX, (port, Box::new(server)));
            }
            LanguageMode::PY => {
                let mut server = ForwardServer::new(PylsCommandBuilder);
                let port = server.start().await.map_err(|e| e.to_string())?;
                guard.insert(LanguageMode::PY, (port, Box::new(server)));
            }
        }
    }

    Ok(guard.get(&mode).unwrap().0)
}

#[tauri::command]
pub async fn open_devtools<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
    window.open_devtools();
    Ok(())
}
