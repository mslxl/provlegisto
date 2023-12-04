import { invoke } from "@tauri-apps/api"

export const getHostname: () => Promise<string> = () => invoke<string>("get_hostname")

export enum SystemName {
  linux = "linux",
  windows = "windows",
  macos = "macos",
  unknown = "",
}

export const getSystemName: () => Promise<SystemName> = () => invoke("get_system_name")
