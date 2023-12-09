use std::process::Command;

// The process is a console application that is being run without a console window. Therefore, the console handle for the application is not set.
pub const CREATE_NO_WINDOW: u32 = 0x08000000;
// For console processes, the new process does not inherit its parent's console (the default). The new process can call the AllocConsole function at a later time to create a console. For more information, see Creation of a Console. This value cannot be used with CREATE_NEW_CONSOLE.
pub const DETACHED_PROCESS: u32 = 0x00000008;
// The new process has a new console, instead of inheriting its parent's console (the default). For more information, see Creation of a Console.
pub const CREATE_NEW_CONSOLE: u32 = 0x00000010;

pub fn hide_new_console(_command: &mut Command) {
    #[cfg(all(debug_assertions, windows))]
    {
        use std::os::windows::process::CommandExt;
        _command.creation_flags(CREATE_NEW_CONSOLE);
    }
    #[cfg(all(not(debug_assertions), windows))]
    {
        use std::os::windows::process::CommandExt;
        _command.creation_flags(CREATE_NO_WINDOW);
    }
}

pub fn create_new_console(_command: &mut Command) {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        _command.creation_flags(CREATE_NEW_CONSOLE);
    }
}
