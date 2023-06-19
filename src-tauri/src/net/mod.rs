use std::{
    collections::HashMap,
    hash::Hash,
    net::{Ipv4Addr, SocketAddr},
};
use tokio::net::UdpSocket;

use self::host::Host;

static PROC_VERSION_CODE: u32 = 0;

pub mod datagram;
pub mod host;
pub mod tcp_state;

struct MixedSocket {
    socket: UdpSocket,
    udp_buffer: Vec<Vec<u8>>,
    tcp_buffer: HashMap<Host, (Vec<u8>)>,
}

impl MixedSocket {
    pub async fn bind(host: Host) -> std::io::Result<MixedSocket> {
        let (bind, port) = host.tuple();
        let ip_addr = Ipv4Addr::new(bind.0, bind.1, bind.2, bind.3);
        let socket = UdpSocket::bind((ip_addr, port)).await?;

        Ok(MixedSocket {
            socket,
            udp_buffer: Vec::new(),
            tcp_buffer: HashMap::new(),
        })
    }

    pub async fn udp_send(&mut self, data: &[u8], host: Host) -> std::io::Result<()> {
        todo!()
    }

    pub async fn tcp_connect(&mut self, data: &[u8], host: Host) -> std::io::Result<()> {
        todo!()
    }

    pub async fn tcp_disconnect(&mut self, host: Host) -> std::io::Result<()> {
        todo!()
    }

    async fn req_update(&mut self, addr: &SocketAddr) -> std::io::Result<()> {
        todo!()
    }

    async fn handle_tcp(&mut self, data: &[u8], host: Host) {}

    async fn handle_udp(&mut self, data: &[u8]) {
        self.udp_buffer.push(Vec::from(data))
    }

    async fn recv(&mut self) -> std::io::Result<()> {
        let mut ty: [u8; 1] = [0; 1];

        let (_, addr) = self.socket.recv_from(&mut ty).await?;
        let ty = ty[0];

        let mut size: [u8; 4] = [0; 4];
        self.socket.recv(&mut size).await?;
        let size = ((size[0] as u32) << 3)
            | ((size[1] as u32) << 2)
            | ((size[2] as u32) << 1)
            | size[3] as u32;

        let mut buff = Vec::with_capacity(size as usize);
        self.socket.recv_buf(&mut buff).await?;

        let prog_version = &buff[0..4];
        let prog_version = ((prog_version[0] as u32) << 3)
            | ((prog_version[1] as u32) << 2)
            | ((prog_version[2] as u32) << 1)
            | (prog_version[3] as u32);

        if prog_version != PROC_VERSION_CODE {
            self.req_update(&addr).await?;
            return Ok(())
        }

        let data = &buff[4..];

        match ty {
            0 => self.handle_udp(data).await,
            1 => self.handle_tcp(data, addr.into()).await,
            _ => unreachable!(),
        }
        Ok(())
    }
}
