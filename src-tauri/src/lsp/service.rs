use async_trait::async_trait;
use tokio::net::TcpStream;
use tokio_tungstenite::WebSocketStream;

use super::clangd_service::ClangdService;

#[async_trait]
pub trait LSPService: Sync + Send {
    async fn is_available(&self) -> Result<bool, String>;
    async fn init(&mut self);
    async fn accept(&mut self, ws: WebSocketStream<TcpStream>);
}

pub trait LSPServiceBuilder: Sync + Send {
    fn create(&self) -> Box<dyn LSPService>;
}
pub struct LSPRegister;

impl Default for LSPRegister {
    fn default() -> Self {
        Self
    }
}
impl LSPRegister {
    pub fn create_by_id(&self, id: &str) -> Option<Box<dyn LSPService>> {
        match id.to_lowercase().as_str() {
            "clangd" => Some(Box::new(ClangdService)),
            _ => None,
        }
    }
}
