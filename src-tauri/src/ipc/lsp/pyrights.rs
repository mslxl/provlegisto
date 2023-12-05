use std::process::Command;

use super::forward_server::LspCommandBuilder;

#[derive(Clone)]
pub struct PylsCommandBuilder(pub Option<String>);
unsafe impl Sync for PylsCommandBuilder {}
unsafe impl Send for PylsCommandBuilder {}
impl LspCommandBuilder for PylsCommandBuilder {
    fn build(&self) -> std::process::Command {
        let mut cmd = Command::new(self.0.as_ref().map(|s| s.as_str()).unwrap_or("pyright-langserver"));
        cmd.args(["--stdio"]);
        cmd
    }
}
