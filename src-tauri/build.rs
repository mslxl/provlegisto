use std::{fs, path::PathBuf, process::Command};

fn main() {
    let bin_dir = PathBuf::from("bin");
    if !bin_dir.exists() {
        fs::create_dir_all("bin").unwrap();
    }
    Command::new("g++")
        .args([
            "-O2",
            "util/prov_console_run.cpp",
            "-o",
            "bin/prov_console_run",
        ])
        .spawn()
        .expect("fail to spawn g++")
        .wait()
        .expect("g++ compile file");
    tauri_build::build()
}
