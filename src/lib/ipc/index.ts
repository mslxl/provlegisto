import { invoke } from "@tauri-apps/api"

export * from "./lsp"
export * from "./rt"

export enum LanguageMode {
  CXX = "CXX",
  PY = "PY",
}

export const openDevTools = (): Promise<void> => invoke("open_devtools")
