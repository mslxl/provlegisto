use super::datagram::TcpDatagram;

pub trait DFA<'a, V, T, E>
where
    T: DFA<'a, V, T, E> + 'a,
{
    fn accept(&self, params: V) -> Result<dyn T, E>;
    fn is_final(&self) -> bool;
}

struct DFAInterfer<'a, V, T, E> {
    state: Box<dyn DFA<'a, V, T, E> + 'a>,
}

impl<'a, V, T, E> DFAInterfer<'a, V, T, E>
where
    T: DFA<'a, V, T, E>,
{

    pub fn start(initial: T) -> Self{
      DFAInterfer { state: Box::new(initial) }
    }

    pub fn accept(&mut self, params: V) -> Result<(), E> {
        let state = Box::new(self.state.accept(params)?);
        self.state = state;
        Ok(())
    }

    pub fn is_final(&self) -> bool {
        self.state.is_final()
    }
}

struct TCPServerStart;
impl DFA<'_, TcpDatagram, 