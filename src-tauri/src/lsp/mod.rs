use tokio::sync::Mutex;

use crate::net::RemoteState;

use self::adapter::{LSPAdpaterT, LocalLSPAdapter};

pub mod adapter;
pub mod clangd_service;
pub mod service;

pub struct LSPState {
    mu: Mutex<Option<Box<dyn LSPAdpaterT>>>,
}
impl Default for LSPState {
    fn default() -> Self {
        Self {
            mu: Mutex::new(None),
        }
    }
}
impl LSPState {
    pub async fn close(&self) {
        let mut guard = self.mu.lock().await;
        *guard = None;
    }

    pub async fn use_local(&self) {
        let mut guard = self.mu.lock().await;
        *guard = Some(Box::new(LocalLSPAdapter::new()));
        guard.as_mut().unwrap().start().await;
    }
}

#[tauri::command]
pub async fn enable_lsp_adapter(
    state: tauri::State<'_, LSPState>,
    net_state: tauri::State<'_, RemoteState>,
    status: i32,
) -> Result<(), String> {
    match status {
        0 => state.close().await,
        1 => state.use_local().await,
        _ => unreachable!(),
    }
    Ok(())
}
