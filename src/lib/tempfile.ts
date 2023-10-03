import { invoke } from "@tauri-apps/api"

export async function saveToTempfile(content: string, ext: string): Promise<string> {
  return await invoke("save_to_tempfile", { content, ext })
}
