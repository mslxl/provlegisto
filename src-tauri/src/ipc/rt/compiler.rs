use anyhow::Result;
use async_trait::async_trait;
#[async_trait]
pub trait Compiler {
    fn set_source_code(&mut self, path: &str);
    fn set_target(&mut self, path: &str);
    async fn launch(&self) -> Result<String>;
}
