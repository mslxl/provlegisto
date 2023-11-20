use tauri::Runtime;
use tokio::{io::AsyncReadExt, net::TcpListener, sync::Mutex, task::JoinHandle};

pub struct CompetitiveCompanionState {
    s: Mutex<Option<JoinHandle<()>>>,
}

impl Default for CompetitiveCompanionState {
    fn default() -> Self {
        Self {
            s: Mutex::new(None),
        }
    }
}

// remember to call `.manage(MyState::default())`
#[tauri::command]
pub async fn enable_competitive_companion<R: Runtime>(
    state: tauri::State<'_, CompetitiveCompanionState>,
    window: tauri::Window<R>,
) -> Result<(), String> {
    let mut guard = state.s.lock().await;
    let listener = TcpListener::bind(format!("127.0.0.1:{}", 10043))
        .await
        .map_err(|e| e.to_string())?;
    log::info!(
        "listen competitive companion on {}",
        listener.local_addr().unwrap().to_string()
    );
    let handle = tokio::spawn(async move {
        loop {
            let (mut stream, _) = listener.accept().await.unwrap();
            let mut content = String::new();
            stream.read_to_string(&mut content).await.unwrap();
            content = content.lines().skip_while(|l| !l.is_empty()).collect();

            log::info!("received competitive companion content: {}", content);
            window.emit("competitive-companion", content).unwrap();
        }
    });
    *guard = Some(handle);
    Ok(())
}

#[tauri::command]
pub async fn disable_competitive_companion(
    state: tauri::State<'_, CompetitiveCompanionState>,
) -> Result<(), String> {
    let mut guard = state.s.lock().await;
    if let Some(handle) = &mut *guard {
        log::info!("stop to listen competitive companion");
        handle.abort();
    }
    *guard = None;
    Ok(())
}
