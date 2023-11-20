use std::process::Stdio;

use crate::util::console;
use futures_util::{SinkExt, StreamExt};

use super::LspServer;
use anyhow::Result;
use async_trait::async_trait;
use std::process::Command;
use tokio::{
    io::{AsyncBufReadExt, AsyncReadExt, AsyncWriteExt, BufReader},
    net::{TcpListener, TcpStream},
    sync::Mutex,
    task::JoinHandle,
};
use tokio_tungstenite::{
    tungstenite::{
        handshake::server::{ErrorResponse, Request, Response},
        Message,
    },
    WebSocketStream,
};

pub trait LspCommandBuilder: Clone + Copy + Send + Sync {
    fn build(&self) -> Command;
}

pub struct ForwardServer<T>
where
    T: LspCommandBuilder,
{
    program: T,
    handle: Mutex<Option<JoinHandle<()>>>,
}

impl<T: LspCommandBuilder> ForwardServer<T> {
    pub fn new(builder: T) -> Self {
        Self {
            program: builder,
            handle: Mutex::new(None),
        }
    }
}

impl<T: LspCommandBuilder> ForwardServer<T> {
    async fn accept_stream(
        mut command: Command,
        _path: String,
        stream: WebSocketStream<TcpStream>,
    ) {
        {
            #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
            console::hide_new_console(&mut command);
        }
        let mut command = tokio::process::Command::from(command);
        command.stdin(Stdio::piped());
        command.stdout(Stdio::piped());
        command.stderr(Stdio::inherit());
        let proc = command.spawn().unwrap();
        let pid = proc.id().unwrap();
        let stdout = proc.stdout.unwrap();
        let mut stdin = proc.stdin.unwrap();
        let (ws_outcoming, mut ws_incoming) = stream.split();
        let handle = tokio::spawn(async move {
            // transfer
            // forward to client from server
            let mut reader = BufReader::new(stdout);
            let mut outcomimg = ws_outcoming;
            loop {
                let mut header = String::new();
                let sz = reader.read_line(&mut header).await.unwrap();
                if sz == 0 {
                    // client disconnect
                    log::info!("server pid {} exited", pid);
                    break;
                }
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
        tokio::spawn(async move {
            while let Some(Ok(msg)) = ws_incoming.next().await {
                let mut msg = msg.into_text().unwrap();
                msg.push_str("\r\n");
                let data = msg.as_bytes();
                stdin
                    .write_all(format!("Content-Length: {}\r\n\r\n", data.len()).as_bytes())
                    .await
                    .unwrap();
                stdin.write_all(data).await.unwrap();
                stdin.flush().await.unwrap();
            }
            handle.abort()
        });
    }
}

#[async_trait]
impl<T: LspCommandBuilder + 'static> LspServer for ForwardServer<T> {
    async fn start(&mut self) -> Result<u16> {
        let tcp = TcpListener::bind("127.0.0.1:0").await?;
        let port = tcp.local_addr()?.port();
        let builder = self.program.clone();
        log::info!(
            "forward lsp server listen on: {}",
            tcp.local_addr().unwrap().to_string()
        );
        let handle = tokio::spawn(async move {
            while let Ok((stream, addr)) = tcp.accept().await {
                let mut path = None;
                let callback = |req: &Request,
                                res: Response|
                 -> std::result::Result<Response, ErrorResponse> {
                    path = Some(req.uri().path().to_string());
                    Ok(res)
                };
                let ws = tokio_tungstenite::accept_hdr_async(stream, callback)
                    .await
                    .unwrap();
                let path = path.unwrap();
                log::info!(
                    "language server server accpet connect from {}",
                    addr.to_string()
                );
                tokio::spawn(Self::accept_stream(builder.build(), path, ws));
            }
        });
        let mut guard = self.handle.lock().await;
        *guard = Some(handle);
        Ok(port)
    }

    async fn stop(&mut self) -> Result<()> {
        let mut guard = self.handle.lock().await;
        if let Some(handle) = &*guard {
            handle.abort();
        }
        *guard = None;
        Ok(())
    }
}
