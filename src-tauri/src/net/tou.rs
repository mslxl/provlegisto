use std::{rc::Rc, net::SocketAddr, collections::{HashSet, VecDeque}, ops::Shl};

use tokio::{net::UdpSocket, sync::{RwLock, Mutex}};
use anyhow::Error;
static MAX_DATAGRAM_SIZE: usize = 2 * 1024 / 8;


macro_rules! as_number {
    ($ty: ty, $data: expr) => {
      $data.iter().fold(0 as $ty, | hb, lb| (hb << 8) | (*lb as $ty))
    };
}

enum TouPacketType{
  Try,

  Syn,
  Ack,
  Fin,
  Data
}
struct TouPacket{
  size: u64,
  ty: TouPacketType,
  data: Vec<u8>
}

impl TouPacket{
  fn from_bytes(data: &[u8]) -> Self{
    todo!()
  }
  fn as_bytes(self) -> Vec<u8>{
    todo!()
  }
}

struct TouCore{
  socket: UdpSocket,
}

/// Tcp over UDP socket
pub struct TouSocket{
  core: Rc<Mutex<TouCore>>,
  pool: HashSet<SocketAddr, TouListenStream>
}

enum TouState {
  Close,
  Listen,
  SynSend,
  SynRecv,
  Establish,

  Connnected,
  Disconnect,
}

pub trait TouStream{

}

pub struct TouListenStream{
  host: SocketAddr,
  state: RwLock<TouCore>,
  core: Rc<Mutex<TouCore>>,
  buffer: VecDeque<TouPacket>
}


impl TouSocket{
  pub async fn pending_block(&self){
    let _ = self.core.lock().await;
  }
  async fn recv(&mut self)->Result<(), Error>{
    let guard = self.core.lock().await;
    let mut data = vec![0; MAX_DATAGRAM_SIZE];
    let (_, addr) = guard.socket.recv_buf_from(&mut data).await?;

    Ok(())
  }


  pub async fn accept(&mut self)->Result<&mut TouCore, Error>{
    todo!()
  }
}