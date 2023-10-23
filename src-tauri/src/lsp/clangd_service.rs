use std::process::Stdio;

use async_trait::async_trait;
use futures_util::{SinkExt, StreamExt};
use tokio::{
    io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader},
    net::TcpStream,
    process::Command,
};
use tokio_tungstenite::{tungstenite::Message, WebSocketStream};

use crate::platform::{self, apply_win_flags};

use super::service::{LSPService, LSPServiceBuilder};

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
        let proc = apply_win_flags(
            Command::new("clangd").args(["--version"]),
            platform::CREATE_NO_WINDOW,
        )
        .spawn()
        .map_err(|e| e.to_string())?;
        let output = proc.wait_with_output().await.map_err(|e| e.to_string())?;
        Ok(output.status.success())
    }
    async fn init(&mut self) {}
    async fn accept(&mut self, ws: WebSocketStream<TcpStream>) {
        let proc = apply_win_flags(
            Command::new("clangd")
                .args([
                    "--pch-storage=memory",
                    "--clang-tidy",
                    "--header-insertion=iwyu",
                    "--completion-style=detailed",
                ])
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::null()),
            platform::CREATE_NO_WINDOW,
        )
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
