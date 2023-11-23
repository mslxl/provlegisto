use std::process::Command;

fn gcc(inp: &str, oup: &str) {
    assert!(Command::new("c++")
        .args([inp, "-o", oup])
        .spawn()
        .unwrap()
        .wait()
        .unwrap()
        .success());
}
fn main() {
    if cfg!(windows) {
        gcc(
            "src-util/consolepauser.windows.cpp",
            "src-util/build/consolepauser",
        )
    } else {
        gcc(
            "src-util/consolepauser.unix.cpp",
            "src-util/build/consolepauser",
        )
    }
    gcc("src-util/ncmp.cpp", "src-util/build/ncmp");
    gcc("src-util/rcmp.cpp", "src-util/build/rcmp");
    gcc("src-util/rcmp4.cpp", "src-util/build/rcmp4");
    gcc("src-util/rcmp6.cpp", "src-util/build/rcmp6");
    gcc("src-util/rcmp9.cpp", "src-util/build/ncmp9");
    gcc("src-util/wcmp.cpp", "src-util/build/wcmp");
    gcc("src-util/yesno.cpp", "src-util/build/yesno");
    tauri_build::build();
}
