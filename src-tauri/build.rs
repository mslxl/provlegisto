use std::{fs, path::PathBuf, process::Command};

fn gcc_compile(file: &str, target: Option<&str>, mut args: Vec<String>) {
    if (cfg!(windows) && PathBuf::from(format!("bin/{}.exe", file)).exists())
        || (cfg!(not(windows)) && PathBuf::from(format!("bin/{}", file)).exists())
    {
        return;
    }

    let target = target.unwrap_or(file);
    let mut compile_args = vec![
        "-O2".to_owned(),
        format!("bin_src/{}.cpp", file),
        "-o".to_owned(),
        format!("bin/{}", target),
    ];
    compile_args.append(&mut args);
    let status = Command::new("g++")
        .args(&compile_args)
        .spawn()
        .expect("fail to spawn g++")
        .wait()
        .expect("g++ compile file");
    assert!(status.success());
}

fn main() {
    let bin_dir = PathBuf::from("bin");
    if !bin_dir.exists() {
        fs::create_dir_all("bin").unwrap();
    }
    if cfg!(windows) {
        gcc_compile("consolepauser/windows", Some("consolepauser"), vec![]);
    } else {
        gcc_compile(
            "consolepauser/unix",
            Some("consolepauser"),
            vec![String::from("-lrt")],
        );
    }
    gcc_compile("ncmp", None, vec![]);
    gcc_compile("rcmp", None, vec![]);
    gcc_compile("rcmp4", None, vec![]);
    gcc_compile("rcmp6", None, vec![]);
    gcc_compile("rcmp9", None, vec![]);
    gcc_compile("yesno", None, vec![]);
    gcc_compile("wcmp", None, vec![]);
    tauri_build::build()
}
