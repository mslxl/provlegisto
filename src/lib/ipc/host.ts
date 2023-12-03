import { invoke } from "@tauri-apps/api"

export const getHostname: () => Promise<string> = async () => invoke<string>("get_hostname")
