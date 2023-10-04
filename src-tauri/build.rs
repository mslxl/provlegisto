use std::{fs, path::PathBuf, process::Command};

fn gcc_compile(file: &str) {
    if PathBuf::from(format!("bin/{}.exe", file)).exists() {
        return;
    }
    Command::new("g++")
        .args([
            "-O2",
            &format!("bin_src/{}.cpp", file),
            "-o",
            &format!("bin/{}", file),
        ])
        .spawn()
        .expect("fail to spawn g++")
        .wait()
        .expect("g++ compile file");
}

fn main() {
    let bin_dir = PathBuf::from("bin");
    if !bin_dir.exists() {
        fs::create_dir_all("bin").unwrap();
    }
    gcc_compile("prov_console_run");
    gcc_compile("ncmp");
    gcc_compile("rcmp");
    gcc_compile("rcmp4");
    gcc_compile("rcmp6");
    gcc_compile("rcmp9");
    gcc_compile("yesno");
    gcc_compile("wcmp");
    tauri_build::build()
}
