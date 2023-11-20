use std::process::Command;

use super::forward_server::LspCommandBuilder;

#[derive(Copy, Clone)]
pub struct ClangdCommandBuilder;
unsafe impl Sync for ClangdCommandBuilder {}
unsafe impl Send for ClangdCommandBuilder {}
impl LspCommandBuilder for ClangdCommandBuilder {
    fn build(&self) -> std::process::Command {
        let mut cmd = Command::new("clangd");
        cmd.args([
            "--pch-storage=memory",
            "--clang-tidy",
            "--header-insertion=iwyu",
            "--completion-style=detailed",
        ]);
        cmd
    }
}
