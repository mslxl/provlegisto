use std::collections::HashMap;

use crate::ipc::{
    lsp::{clangd::ClangdCommandBuilder, forward_server::ForwardServer, LspServer},
    ws::ws_ipc_route,
    LanguageMode,
};
use tokio::{net::TcpListener, sync::Mutex};
use tokio_tungstenite::{
    accept_hdr_async,
    tungstenite::handshake::server::{ErrorResponse, Request, Response},
};

#[tauri::command]
pub async fn bind_ws_ipc() -> Result<u16, String> {
    let tcp_listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| e.to_string())?;
    let port = tcp_listener.local_addr().unwrap().port();
    log::info!(
        "ipc websocks listen on {}",
        tcp_listener.local_addr().unwrap().to_string()
    );

    tokio::spawn(async move {
        while let Ok((stream, _)) = tcp_listener.accept().await {
            let mut path = None;
            let callback = |req: &Request, res: Response| -> Result<Response, ErrorResponse> {
                path = Some(req.uri().path().to_string());
                Ok(res)
            };
            let ws = accept_hdr_async(stream, callback).await.unwrap();
            let path = path.unwrap();
            if "/interrupt" == path {
                break;
            }
            tokio::spawn(ws_ipc_route(path, ws));
        }
    });

    Ok(port)
}

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
    dbg!(&mode);
    if !guard.contains_key(&mode) {
        match mode {
            LanguageMode::CXX => {
                let mut server = ForwardServer::new(ClangdCommandBuilder);
                let port = server.start().await.map_err(|e| e.to_string())?;
                guard.insert(LanguageMode::CXX, (port, Box::new(server)));
            }
        }
    }

    Ok(guard.get(&mode).unwrap().0)
}
