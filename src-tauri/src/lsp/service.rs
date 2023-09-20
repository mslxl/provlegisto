use std::process::Stdio;
use std::{collections::HashMap, sync::Arc};

use async_trait::async_trait;
use futures_util::SinkExt;
use futures_util::StreamExt;

use tokio::io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;
use tokio::process;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::WebSocketStream;

#[async_trait]
pub trait LSPService: Sync + Send {
    async fn is_available(&self) -> Result<bool, String>;
    async fn init(&mut self);
    async fn accept(&mut self, ws: WebSocketStream<TcpStream>);
}

pub trait LSPServiceBuilder: Sync + Send {
    fn create(&self) -> Box<dyn LSPService>;
}
pub struct LSPRegister {
    item: Arc<HashMap<String, Box<dyn LSPServiceBuilder>>>,
}

impl Default for LSPRegister {
    fn default() -> Self {
        let mut map: HashMap<String, Box<dyn LSPServiceBuilder>> = HashMap::new();
        map.insert(String::from("clangd"), Box::new(ClangdServiceBuilder));
        Self {
            item: Arc::new(map),
        }
    }
}
impl LSPRegister {
    pub fn create_by_id(&self, id: &str) -> Option<Box<dyn LSPService>> {
        if !self.item.contains_key(id) {
            None
        } else {
            let builder = self.item.get(id).unwrap();
            Some(builder.create())
        }
    }
}

pub struct ClangdServiceBuilder;
impl LSPServiceBuilder for ClangdServiceBuilder {
    fn create(&self) -> Box<dyn LSPService> {
        Box::new(ClangdService)
    }
}

pub struct ClangdService;
#[async_trait]
impl LSPService for ClangdService {
    async fn is_available(&self) -> Result<bool, String> {
        let proc = process::Command::new("clangd")
            .args(["--version"])
            .spawn()
            .map_err(|e| e.to_string())?;
        let output = proc.wait_with_output().await.map_err(|e| e.to_string())?;
        Ok(output.status.success())
    }
    async fn init(&mut self) {}
    async fn accept(&mut self, ws: WebSocketStream<TcpStream>) {
        let proc = process::Command::new("clangd")
            .args([
                "--pch-storage=memory",
                "--clang-tidy",
                "--header-insertion=iwyu",
                "--completion-style=detailed",
            ])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .unwrap();
        let stdout = proc.stdout.unwrap();
        let mut stdin = proc.stdin.unwrap();
        let (ws_outcoming, mut ws_incoming) = ws.split();
        tokio::spawn(async move {
            while let Some(Ok(msg)) = ws_incoming.next().await {
                let msg = msg.into_text().unwrap();
                let data = msg.as_bytes();
                stdin
                    .write_all(format!("Content-Length: {}\r\n\r\n", data.len()).as_bytes())
                    .await
                    .unwrap();
                stdin.write_all(data).await.unwrap();
                stdin.flush().await.unwrap();
            }
        });
        tokio::spawn(async move {
            let mut reader = BufReader::new(stdout);
            let mut outcomimg = ws_outcoming;
            loop {
                let mut header = String::new();
                reader.read_line(&mut header).await.unwrap();
                let len: u64 = header[15..].trim().parse().unwrap();
                let mut buf: Vec<u8> = Vec::with_capacity(len as usize);

                let mut trash = String::new();
                reader.read_line(&mut trash).await.unwrap();

                let mut chunk = (&mut reader).take(len);
                chunk.read_to_end(&mut buf).await.unwrap();

                let data = String::from_utf8(buf).unwrap();
                outcomimg.send(Message::Text(data)).await.unwrap();
            }
        });
    }
}
