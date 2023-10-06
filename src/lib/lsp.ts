import { invoke } from "@tauri-apps/api"

export async function startLanguageServerProtocolServer(): Promise<number> {
  return await invoke<number>("start_lsp_adapter", {})
}
