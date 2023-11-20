use std::process::Command;

use super::forward_server::LspCommandBuilder;

#[derive(Copy, Clone)]
pub struct PylsCommandBuilder;
unsafe impl Sync for PylsCommandBuilder {}
unsafe impl Send for PylsCommandBuilder {}
impl LspCommandBuilder for PylsCommandBuilder {
    fn build(&self) -> std::process::Command {
        let mut cmd = Command::new("pyright-langserver");
        cmd.args(["--stdio"]);
        cmd
    }
}
