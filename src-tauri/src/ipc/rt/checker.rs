use std::{
    collections::HashMap,
    process::Stdio,
    sync::atomic::{self, AtomicU32},
};

use serde::{Deserialize, Serialize};
use tauri::Runtime;
use tokio::{
    process::Command,
    sync::{
        mpsc::{self, Sender},
        Mutex,
    },
};

use crate::{ipc::LanguageMode, util::console};

use super::compiler::CompilerOptions;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CheckResult {
    AC,
    WA { report: String },
    CheckerInt,
    CheckerCE, // huh
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum CheckerType {
    Internal {
        name: String,
    },
    External {
        mode: LanguageMode,
        source: String,
        compiler_options: CompilerOptions,
        suggest_output_path: Option<String>,
    },
}

#[derive(Default)]
pub struct CheckerState {
    sender_counter: AtomicU32,
    exit_sender: Mutex<HashMap<u32, Sender<()>>>,
}

#[tauri::command]
pub async fn abort_all_checker(state: tauri::State<'_, CheckerState>) -> Result<(), String> {
    let guard = state.exit_sender.lock().await;
    for (_, tx) in guard.iter() {
        let _ = tx.send(()).await;
    }
    Ok(())
}

#[tauri::command]
pub async fn check_answer<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, CheckerState>,
    checker: CheckerType,
    input_file: String,
    expect_file: String,
    output_file: String,
) -> Result<CheckResult, String> {
    let checker_path = match checker {
        CheckerType::Internal { name } => if cfg!(windows) {
            app.path_resolver()
                .resolve_resource(format!("sidecar/{}.exe", name))
        } else {
            app.path_resolver()
                .resolve_resource(format!("sidecar/{}", name))
        }
        .ok_or(String::from("no such the checker"))?,
        _ => unimplemented!(),
    };
    let mut command = std::process::Command::new(checker_path);
    console::hide_new_console(&mut command);
    let mut command = Command::from(command);
    command.stderr(Stdio::piped());
    command.arg(input_file);
    command.arg(output_file);
    command.arg(expect_file);

    let proc = command.spawn().map_err(|e| e.to_string())?;
    // get ready for abort tasks gracefully
    let (tx, mut rx) = mpsc::channel(1);
    // txid is used for collect channel after task was aborted gracefully

    let txid = state.sender_counter.load(atomic::Ordering::Acquire);
    state.sender_counter.fetch_add(1, atomic::Ordering::Acquire);
    {
        let mut guard = state.exit_sender.lock().await;
        guard.insert(txid, tx);
    }

    // subproc exit, or abort task
    let result = tokio::select! {
        output = proc.wait_with_output() => {
            let output = output.map_err(|e| e.to_string())?;
            if output.status.success() {
                Ok(CheckResult::AC)
            } else {
                let msg = (*String::from_utf8_lossy(&output.stderr)).to_owned();
                Ok(CheckResult::WA { report: msg })
            }
        }
        _ = rx.recv() => {
            Ok(CheckResult::CheckerInt)
        }
    };

    // collect channel that has been closed
    {
        let mut guard = state.exit_sender.lock().await;
        guard.remove(&txid);
    }
    result
}
