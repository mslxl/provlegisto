use tokio::sync::Mutex;

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
    pub async fn start_local(&self) -> Result<u16, String> {
        let mut guard = self.mu.lock().await;
        *guard = Some(Box::new(LocalLSPAdapter::new()));
        guard.as_mut().unwrap().start().await
    }
}

/// Start lsp adapter
/// If target_ip is none, it will start local lsp adpater
/// Or it will try to connect remote lsp adapter via UDP tunnel(if exists)
#[tauri::command]
pub async fn start_lsp_adapter(
    state: tauri::State<'_, LSPState>,
    target_ip: Option<String>,
) -> Result<u16, String> {
    if let Some(target_ip) = target_ip {
        unimplemented!()
    } else {
        state.start_local().await
    }
}
