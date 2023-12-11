use std::collections::HashMap;
use std::hash::Hash;
use std::{collections::hash_map::DefaultHasher, hash::Hasher};

use futures_util::stream::{SplitSink, SplitStream};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use tokio::net::TcpStream;
use tokio::task::JoinHandle;
use tokio::{net::TcpListener, sync::Mutex};
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::WebSocketStream;

#[derive(Default)]
pub struct CollabState {
    port: Mutex<Option<(u16, JoinHandle<()>)>>,
    tx_pool: Mutex<HashMap<ConnectID, SplitSink<WebSocketStream<TcpStream>, Message>>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
struct ConnectID(i32);

fn calculate_hash<T: Hash>(t: &T) -> i32 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish() as i32
}

#[derive(Debug, Serialize, Deserialize)]
struct CollabRecvPayload {
    connection: i32,
    data: String,
}

async fn bridge_rx<R: Runtime>(
    id: ConnectID,
    window: tauri::Window<R>,
    mut rx: SplitStream<WebSocketStream<TcpStream>>,
) {
    while let Some(msg) = rx.next().await {
        let msg = msg.unwrap();
        let text = msg.into_text().unwrap();
        window
            .emit(
                "prov://collab-recv",
                &CollabRecvPayload {
                    connection: id.0,
                    data: text,
                },
            )
            .unwrap();
    }
    let state = window.state::<CollabState>();
    let mut lock = state.tx_pool.lock().await;
    lock.remove(&id);
}

#[tauri::command]
pub async fn collab_start<R: Runtime>(
    handle: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    state: tauri::State<'_, CollabState>,
) -> Result<u16, String> {
    let mut port_guard = state.port.lock().await;
    if let Some(p) = port_guard.as_ref() {
        return Ok(p.0);
    }

    let tcp_listener = TcpListener::bind("0.0.0.0:0")
        .await
        .map_err(|e| e.to_string())?;
    let port = tcp_listener.local_addr().unwrap().port();

    let handle = tokio::spawn(async move {
        loop {
            let connect = tcp_listener.accept().await;
            if let Err(e) = connect {
                log::error!("{}", e);
                continue;
            }
            let (connect, addr) = connect.unwrap();
            let connect_id = ConnectID(calculate_hash(&addr));
            log::info!("collab peer arrive: {} ({:?})", &addr, &connect_id);
            let ws = tokio_tungstenite::accept_async(connect).await;
            if let Err(e) = ws {
                log::error!("fail to establish websocket connect with {}: {}", &addr, e);
                continue;
            }
            let ws = ws.unwrap();
            let (tx, rx) = ws.split();
            let collab_state = handle.state::<CollabState>();
            let mut tx_pool = collab_state.tx_pool.lock().await;
            tx_pool.insert(connect_id, tx);
            let hd = window.clone();
            tokio::spawn(bridge_rx(connect_id, hd.clone(), rx));
        }
    });
    (*port_guard) = Some((port, handle));

    Ok(port)
}

#[tauri::command]
pub async fn collab_reply(
    state: tauri::State<'_, CollabState>,
    id: i32,
    data: String,
) -> Result<(), String> {
    let id = ConnectID(id);
    let mut tx_guard: tokio::sync::MutexGuard<'_, HashMap<ConnectID, SplitSink<WebSocketStream<TcpStream>, Message>>> = state.tx_pool.lock().await;
    let tx = tx_guard
        .get_mut(&id)
        .ok_or(format!("No such connection {}", id.0))?;
    tx.send(Message::Text(data))
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
