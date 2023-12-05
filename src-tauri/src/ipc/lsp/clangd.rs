use std::process::Command;

use super::forward_server::LspCommandBuilder;

#[derive(Clone)]
pub struct ClangdCommandBuilder(pub Option<String>);
unsafe impl Sync for ClangdCommandBuilder {}
unsafe impl Send for ClangdCommandBuilder {}
impl LspCommandBuilder for ClangdCommandBuilder {
    fn build(&self) -> std::process::Command {
        let mut cmd = Command::new(self.0.as_ref().map(|s|s.as_str()).unwrap_or("clangd"));
        cmd.args([
            "--pch-storage=memory",
            "--clang-tidy",
            "--header-insertion=iwyu",
            "--completion-style=detailed",
        ]);
        cmd
    }
}
