use async_trait::async_trait;
use log::info;
use regex::Regex;
use std::sync::Arc;
use tokio::{net::TcpListener, task::JoinHandle};
use tokio_tungstenite::tungstenite::handshake::server::{ErrorResponse, Request, Response};

use crate::lsp::service::LSPRegister;

const PORT: u16 = 3000;
#[async_trait]
pub trait LSPAdpater: Send + Sync {
    async fn start(&mut self);
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
impl LSPAdpater for LocalLSPAdapter {
    async fn start(&mut self) {
        info!("Local LSP Adapter started");
        let tcp = TcpListener::bind(format!("127.0.0.1:{}", PORT))
            .await
            .unwrap();

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
                info!("{}: {}({})", &addr, &ls_name, &code_id);
                tokio::spawn(async move {
                    let register = LSPRegister::default();
                    let mut lsp = register.create_by_id(&ls_name).unwrap();
                    lsp.accept(ws).await;
                });
            }
        });
        self.handle = Arc::new(Some(handle))
    }
}
