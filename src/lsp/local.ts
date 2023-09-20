import { invoke } from "@tauri-apps/api"

export async function startLocalLSP(): Promise<number> {
  return await invoke<number>("switch_lsp_adapter", { status: 1 })
}
export async function stopLSP(): Promise<number> {
  return await invoke<number>("switch_lsp_adapter", { status: 0 })
}
