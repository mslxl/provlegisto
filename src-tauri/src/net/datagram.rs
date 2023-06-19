pub struct TcpDataFrame {
    seq: u32,
}

pub enum TcpDatagram {
    SYN { maximum_segment_size: u32 },
    ACK,
    FIN,
    DataFrame,
}

pub struct UdpDatagram {
    program_version: u32,
    data: Vec<u8>,
}

pub enum Datagram {
    TcpDatagram(TcpDatagram),
    UdpDatagram(UdpDatagram),
}
