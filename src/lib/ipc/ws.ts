import { invoke } from "@tauri-apps/api"

const bindWsIpc = (): Promise<number> => invoke("bind_ws_ipc")

let port = -1
export async function getWsIpcPort(): Promise<number> {
  if (port == -1) {
    port = await bindWsIpc()
  }
  return port
}
