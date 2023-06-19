use std::net::{IpAddr, Ipv4Addr, SocketAddr};

#[derive(Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Host((u8, u8, u8, u8), u16);

impl Host{
  pub fn tuple(&self) -> ((u8, u8, u8, u8), u16){
    (self.0, self.1)
  }
}

impl From<SocketAddr> for Host {
    fn from(value: SocketAddr) -> Self {
        match value {
            SocketAddr::V4(v4) => {
                let port = v4.port();
                let octets = v4.ip().octets();
                let ip = (octets[0], octets[1], octets[2], octets[3]);
                Self(ip, port)
            }
            SocketAddr::V6(_) => unimplemented!(),
        }
    }
}

impl Into<SocketAddr> for Host {
    fn into(self) -> SocketAddr {
        SocketAddr::new(
            IpAddr::V4(Ipv4Addr::new(self.0 .0, self.0 .1, self.0 .2, self.0 .3)),
            self.1,
        )
    }
}
