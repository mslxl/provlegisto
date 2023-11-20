use tokio::net::TcpStream;
use tokio_tungstenite::WebSocketStream;

pub async fn ws_ipc_route(path: String, ws: WebSocketStream<TcpStream>) {}
