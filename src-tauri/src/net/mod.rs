#[derive(serde::Serialize, serde::Deserialize)]
pub struct RemoteState {
    local: bool,
}
impl RemoteState {
    fn is_local(&self) -> bool {
        self.local
    }
}

impl Default for RemoteState {
    fn default() -> Self {
        Self { local: false }
    }
}
