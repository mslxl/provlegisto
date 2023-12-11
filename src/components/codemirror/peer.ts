import { Extension } from "@codemirror/state"
import peerExtension from "./extension/peerExetnsion"

export type PeerProvider = (host: string, port: number) => Promise<(documentID: number) => Extension>

export const noPeer: PeerProvider = async () => () => []
export const peer: PeerProvider = async (host, port) => {
  return new Promise<(documentID: number) => Extension>((resolve, reject) => {
    let ws = new WebSocket(`ws://${host}:${port}`)
    let builder = (documentID:number) => {
      return peerExtension(0, documentID, ws)
    }
    ws.onopen = () => {
      resolve(builder)
    }
    ws.onerror = (err)=>{
      reject(err)
    }
  })
}
