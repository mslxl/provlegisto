import { invoke } from "@tauri-apps/api"

export async function saveToTempfile(content: string, ext: string): Promise<string> {
  return await invoke<string>("save_to_tempfile", { content, ext })
}

export async function newTempfile(): Promise<string> {
  return await invoke<string>("new_tempfile")
}
