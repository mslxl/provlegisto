use std::{process::Stdio, time::Duration};

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

pub trait LspCommandBuilder: Clone + Send + Sync {
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
        console::hide_new_console(&mut command);
        let mut command = tokio::process::Command::from(command);
        command.stdin(Stdio::piped());
        command.stdout(Stdio::piped());
        command.stderr(Stdio::inherit());
        let mut proc = command.spawn().unwrap();
        let pid = proc.id().unwrap();
        let stdout = proc.stdout.take().unwrap();
        let mut stdin = proc.stdin.take().unwrap();
        let (mut ws_outcoming, mut ws_incoming) = stream.split();
        let mut client_msg_counter = 0;
        let mut server_reader = BufReader::new(stdout);
        loop {
            let mut buf = Vec::new();
            tokio::select! {
                // forward server message to client
                sz = server_reader.read_until(b'\n',&mut buf) => {
                    let buf = String::from_utf8(buf).expect("Found invalid UTF-8");
                    let sz = sz.unwrap();
                    if sz == 0 {
                        log::info!("server pid {} exited spontaneously", pid);
                        break;
                    }
                    let len: u64 = buf[15..].trim().parse().unwrap();
                    let mut buf: Vec<u8> = Vec::with_capacity(len as usize);

                    let mut trash = String::new();
                    server_reader.read_line(&mut trash).await.unwrap();

                    let mut chunk = (&mut server_reader).take(len);
                    chunk.read_to_end(&mut buf).await.unwrap();

                    let data = String::from_utf8(buf).unwrap();

                    ws_outcoming.send(Message::Text(data)).await.unwrap();
                }
                // forward client message to server
                msg = ws_incoming.next() => {
                    if msg.is_none(){
                        log::info!("client associated with pid {} disconnected", pid);
                        break;
                    }
                    client_msg_counter+=1;
                    let msg = msg.unwrap().unwrap();
                    let msg = msg.into_text().unwrap();
                    let data = msg.as_bytes();
                    stdin
                        .write_all(format!("Content-Length: {}\r\n\r\n", data.len()).as_bytes())
                        .await
                        .unwrap();
                    stdin.write_all(data).await.unwrap();
                    stdin.flush().await.unwrap();
                }
                // check valid connection
                _ = tokio::time::sleep(Duration::from_secs(5)), if client_msg_counter < 3 => {
                    log::info!("number of client message less than 3 in 5 seconds, stop server(pid {})", pid);
                    break;
                }
            };
        }
        let _ = proc.kill().await;
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
