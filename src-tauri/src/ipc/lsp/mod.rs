pub mod clangd;
pub mod direct_server;
pub mod forward_server;
pub mod pyrights;

use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait LspServer: Sync + Send {
    async fn start(&mut self) -> Result<u16>;
    async fn stop(&mut self) -> Result<()>;
}
