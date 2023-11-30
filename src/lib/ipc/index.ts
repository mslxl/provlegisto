import { invoke } from "@tauri-apps/api"

export * from "./lsp"
export * from "./rt"

export enum LanguageMode {
  CXX = "CXX",
  PY = "PY",
}

export const openDevTools = (): Promise<void> => invoke("open_devtools")

export const getSettingsPath = (): Promise<string> => invoke("get_settings_path")

export const isDebug = (): Promise<boolean> => invoke("is_debug")