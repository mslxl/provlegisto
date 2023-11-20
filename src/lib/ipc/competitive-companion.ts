import { invoke } from "@tauri-apps/api"

export const enableCompetitiveCompanion = (): Promise<void> => invoke("enable_competitive_companion")
export const disableCompetitiveCompanion = (): Promise<void> => invoke("disable_competitive_companion")
