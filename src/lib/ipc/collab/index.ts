import { invoke, window } from "@tauri-apps/api"
import { Authority } from "./authority"

const authorities = new Map<number, Authority>()
let cancelListener: null | Promise<() => void> = null
export async function collabStart() {
  if (cancelListener) {
    cancelListener.then((fn) => fn())
  }
  cancelListener = listenCollabRecv((res) => {
    let connectionID = res.connection

    let data = JSON.parse(res.data)
    if (!authorities.has(data.documentID)) {
      authorities.set(data.documentID, new Authority(data.documentID))
    }
    let authority = authorities.get(data.documentID)!
    authority.accept(data, (response) => {
      collabReply(connectionID, JSON.stringify({
        id: data.id,
        jsonrpc: data.jsonrpc,
        result: response
      }))
    })
  })
  return invoke<number>("collab_start")
}

export const collabReply = (id: number, data: string) =>
  invoke<void>("collab_reply", {
    id,
    data,
  })

export type CollabRecv = {
  connection: number
  data: any
}

export function listenCollabRecv(cb: (res: CollabRecv) => void) {
  return window.getCurrent().listen("prov://collab-recv", (event) => {
    cb(event.payload as CollabRecv)
  })
}
