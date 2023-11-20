use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait Runner {
    fn set(&mut self, key: &str, value: &str);
    async fn launch(&self) -> Result<()>;
}
