pub mod clangd;
pub mod forward_server;

use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait LspServer: Sync + Send {
    async fn start(&mut self) -> Result<u16>;
    async fn stop(&mut self) -> Result<()>;
}
