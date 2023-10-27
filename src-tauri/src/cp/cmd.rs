use std::{path::PathBuf, process::Stdio, time::Duration};

use tauri::Runtime;
use tokio::process::Command;

use crate::{
    platform::{self, apply_win_flags},
    settings::Settings,
    AppCache,
};

use super::{
    CheckerMessage, CheckerStatus, ExecuatorMessage, ExecuatorStatus, LanguageRegister,
    UserSourceCode,
};

#[tauri::command]
pub async fn cp_compile_src(
    cache: tauri::State<'_, AppCache>,
    settings: Settings,
    src: UserSourceCode,
) -> Result<String, String> {
    // 获取需要的编译器
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    // 通过内容计算文件名
    let hash = sha256::digest(&src.src);

    let src_file = cache.file_with_name(&format!("{}.{}", hash, provider.compiler().ext()));
    let src_filename = src_file.to_str().to_owned().unwrap();
    let target_file = cache.file_with_name(&platform::resolve_exe_or_elf_str(&hash));

    let target_filename = if !target_file.exists() {
        // 文件不存在则编译
        tokio::fs::write(&src_file, &src.src)
            .await
            .map_err(|e| e.to_string())?;
        provider
            .compiler()
            .compile_file(&settings, &cache, src_filename)
            .await?
    } else {
        target_file.to_str().unwrap().to_owned()
    };
    println!("compile {} to {}", &src_filename, &target_filename);

    Ok(target_filename.to_owned())
}

#[tauri::command]
pub async fn cp_run_detached_src<R: Runtime>(
    app: tauri::AppHandle<R>,
    cache: tauri::State<'_, AppCache>,
    settings: Settings,
    src: UserSourceCode,
) -> Result<(), String> {
    let consolepauser = dunce::canonicalize(
        app.path_resolver()
            .resolve_resource(platform::resolve_exe_or_elf_str("bin/consolepauser"))
            .ok_or("failed to resolve bin/consolepauser binary file")?,
    )
    .map_err(|e| e.to_string())?;

    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| String::from("Language is unsupported"))?;

    let exe = cp_compile_src(cache, settings.clone(), src).await?;
    provider
        .executaor()
        .run_detached(&settings, consolepauser.to_str().unwrap(), &exe);
    Ok(())
}

/// Compile src and run with input_file
/// Return output filename if the program end in time
/// Or return error enum and error message if an error was throw
#[tauri::command]
pub async fn cp_compile_run_src(
    cache: tauri::State<'_, AppCache>,
    settings: Settings,
    src: UserSourceCode,
    time_limits: Option<u64>,
    input_file: &str,
) -> Result<ExecuatorMessage, String> {
    let provider = LanguageRegister
        .get(&src.lang)
        .ok_or_else(|| (String::from("Language is unsupported")))?;

    let output_pathbuf = cache.file(Some("out"));
    let output_file = output_pathbuf.to_str().unwrap().to_owned();

    let exe = cp_compile_src(cache, settings.clone(), src).await;
    if exe.is_err() {
        return Ok(ExecuatorMessage::new(
            ExecuatorStatus::CE,
            String::new(),
            None,
        ));
    }

    let time_limits = time_limits.unwrap_or(3000);

    let execuator_res = provider
        .executaor()
        .run(
            &settings,
            &exe.unwrap(),
            input_file,
            &output_file,
            time_limits,
        )
        .await;
    if let Err(err) = execuator_res {
        Ok(ExecuatorMessage {
            status: err.0,
            message: err.1,
            output: None,
        })
    } else {
        Ok(ExecuatorMessage::new(
            ExecuatorStatus::PASS,
            String::new(),
            Some(output_file),
        ))
    }
}

#[tauri::command]
pub async fn cp_run_checker<R: Runtime>(
    app: tauri::AppHandle<R>,
    cache: tauri::State<'_, AppCache>,
    settings: Settings,
    checker: String,
    input_file: String,
    output_file: String,
    answer_file: String,
) -> Result<CheckerMessage, String> {
    let checker = if checker.starts_with("res:") {
        let rel_path = platform::resolve_exe_or_elf_str(&format!("bin/{}", &checker[4..]));
        app.path_resolver()
            .resolve_resource(rel_path)
            .expect("failed to resolve checker resource")
    } else {
        PathBuf::from(checker)
    };
    let report_file = cache.file(Some("report"));
    let mut proc = apply_win_flags(
        Command::new(checker)
            .args([
                &input_file,
                &output_file,
                &answer_file,
                report_file.to_str().unwrap(),
            ])
            .stderr(Stdio::null())
            .stdin(Stdio::null())
            .stderr(Stdio::null()),
        platform::CREATE_NO_WINDOW,
    )
    .spawn()
    .map_err(|e| e.to_string())?;

    match tokio::time::timeout(Duration::from_millis(5000), proc.wait()).await {
        Err(_) => {
            let _ = proc.kill().await;
            return Ok(CheckerMessage::new(
                CheckerStatus::UKE,
                String::from("Checker timeout"),
            ));
        }
        Ok(status) => {
            let report = tokio::fs::read_to_string(report_file)
                .await
                .unwrap_or(String::new());
            let status = status.map_err(|e| e.to_string())?;
            if status.success() {
                Ok(CheckerMessage::new(CheckerStatus::AC, report))
            } else {
                Ok(CheckerMessage::new(CheckerStatus::WA, report))
            }
        }
    }
}
