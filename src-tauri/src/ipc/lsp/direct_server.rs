use anyhow::Result;
use async_trait::async_trait;
use std::process::{Child, Command};

use tokio::{net::TcpListener, sync::Mutex};

use super::LspServer;

pub trait LspCommandWithPortBuilder: Clone + Copy + Send + Sync {
    fn build(&self, port: u16) -> Command;
}

pub struct DirectServer<T>
where
    T: LspCommandWithPortBuilder,
{
    program: T,
    handle: Mutex<Option<Child>>,
}

impl<T: LspCommandWithPortBuilder> DirectServer<T> {
    pub fn new(builder: T) -> Self {
        Self {
            program: builder,
            handle: Mutex::new(None),
        }
    }
}

#[async_trait]
impl<T: LspCommandWithPortBuilder + 'static> LspServer for DirectServer<T> {
    async fn start(&mut self) -> Result<u16> {
        let tcp = TcpListener::bind("127.0.0.1:0").await?;
        let unused_port = tcp.local_addr()?.port();
        std::mem::drop(tcp);

        log::info!("direct server start on port {}", unused_port);
        let child = self.program.build(unused_port).spawn()?;
        let mut guard = self.handle.lock().await;
        *guard = Some(child);
        Ok(unused_port)
    }
    async fn stop(&mut self) -> Result<()> {
        let mut guard = self.handle.lock().await;
        if let Some(child) = &mut *guard {
            child.kill()?;
            *guard = None;
        }
        Ok(())
    }
}
