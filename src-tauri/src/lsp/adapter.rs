use async_trait::async_trait;
use regex::Regex;
use std::sync::Arc;
use tokio::{net::TcpListener, task::JoinHandle};
use tokio_tungstenite::tungstenite::handshake::server::{ErrorResponse, Request, Response};

use crate::lsp::service::LSPRegister;

#[async_trait]
pub trait LSPAdpaterT: Send + Sync {
    async fn start(&mut self) -> Result<u16, String>;
}

pub struct LocalLSPAdapter {
    handle: Arc<Option<JoinHandle<()>>>,
}
impl Drop for LocalLSPAdapter {
    fn drop(&mut self) {
        if let Some(ref handle) = *self.handle {
            handle.abort()
        }
    }
}
impl LocalLSPAdapter {
    pub fn new() -> Self {
        Self {
            handle: Arc::new(None),
        }
    }
}

#[async_trait]
impl LSPAdpaterT for LocalLSPAdapter {
    async fn start(&mut self) -> Result<u16, String> {
        let tcp = TcpListener::bind(format!("127.0.0.1:{}", 0)).await.unwrap();

        let tcp_port = tcp.local_addr().unwrap().port();
        println!("LSP Adapter started on port {}", tcp_port);

        let handle = tokio::spawn(async move {
            let extract_info_regex = Regex::new(r"/(\w+?)/(\w+)").unwrap();
            while let Ok((stream, addr)) = tcp.accept().await {
                let mut path = None;
                let callback = |req: &Request, res: Response| -> Result<Response, ErrorResponse> {
                    path = Some(req.uri().path().to_string());
                    Ok(res)
                };
                let ws = tokio_tungstenite::accept_hdr_async(stream, callback)
                    .await
                    .unwrap();
                let path = path.unwrap();
                let captures = extract_info_regex.captures(&path).unwrap();

                let ls_name = captures.get(1).unwrap().as_str().to_owned();
                let code_id = captures.get(2).unwrap().as_str().to_owned();
                dbg!("Client connected: {} {}({})", &addr, &ls_name, &code_id);
                tokio::spawn(async move {
                    let register = LSPRegister::default();
                    let mut lsp = register.create_by_id(&ls_name).unwrap();
                    lsp.accept(ws).await;
                });
            }
        });
        self.handle = Arc::new(Some(handle));
        Ok(tcp_port)
    }
}
