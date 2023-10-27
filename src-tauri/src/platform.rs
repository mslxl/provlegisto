use std::path::{Path, PathBuf};

use tokio::process::Command;

// The process is a console application that is being run without a console window. Therefore, the console handle for the application is not set.
pub const CREATE_NO_WINDOW: u32 = 0x08000000;
// For console processes, the new process does not inherit its parent's console (the default). The new process can call the AllocConsole function at a later time to create a console. For more information, see Creation of a Console. This value cannot be used with CREATE_NEW_CONSOLE.
pub const DETACHED_PROCESS: u32 = 0x00000008;
// The new process has a new console, instead of inheriting its parent's console (the default). For more information, see Creation of a Console.
pub const CREATE_NEW_CONSOLE: u32 = 0x00000010;

#[cfg(windows)]
pub fn apply_win_flags(command: &mut Command, flag: u32) -> &mut Command {
    command.creation_flags(flag)
}

#[cfg(not(windows))]
pub fn apply_win_flags(command: &mut Command, flag: u32) -> &mut Command {
    command
}
pub fn resolve_exe_or_elf_str(path: &str) -> String {
    if cfg!(windows) {
        if path.ends_with(".exe") {
            path.to_owned()
        } else {
            format!("{}.exe", path)
        }
    } else {
        if path.ends_with(".exe") {
            path[..path.len() - 4].to_owned()
        } else {
            path.to_owned()
        }
    }
}

pub fn resolve_exe_or_elf<P: AsRef<Path>>(path: P) -> PathBuf {
    let mut buf = path.as_ref().to_path_buf();
    if cfg!(windows) {
        buf.set_extension("exe");
    } else {
        buf.set_extension("");
    }
    buf
}

mod tests {
    use crate::platform::resolve_exe_or_elf_str;

    #[test]
    fn test_resolve_exe_or_elf_str() {
        if cfg!(not(windows)) {
            assert_eq!(resolve_exe_or_elf_str("a/b/c.exe"), "a/b/c");
            assert_eq!(resolve_exe_or_elf_str("a/b/c"), "a/b/c");
        } else {
            assert_eq!(resolve_exe_or_elf_str("a/b/c.exe"), "a/b/c.exe");
            assert_eq!(resolve_exe_or_elf_str("a/b/c"), "a/b/c.exe");
        }
    }
}
