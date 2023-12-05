import { invoke } from "@tauri-apps/api"
import { LanguageMode } from "."

export const getLSPServer = (mode: LanguageMode, path?: string): Promise<number> =>
  invoke("get_lsp_server", {
    mode,
    path,
  })
