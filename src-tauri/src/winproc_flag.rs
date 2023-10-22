use tokio::process::Command;

pub const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(windows)]
pub fn apply_win_flags(command: &mut Command, flag: u32) -> &mut Command {
    command.creation_flags(flag)
}

#[cfg(not(windows))]
pub fn apply_win_flags(command: &mut Command, flag: u32) -> &mut Command {
    command
}
