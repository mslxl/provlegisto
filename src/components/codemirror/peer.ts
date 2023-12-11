import { Extension } from "@codemirror/state"
import peerExtension from "./extension/peerExetnsion"
import Client, { RequestManager } from "@open-rpc/client-js"
import TauriWSTransport from "@/lib/TauriWSTransport"

export type PeerProvider = (host: string, port: number) => (documentID: number) => Extension

export const noPeer: PeerProvider = () => () => []

export const peer: PeerProvider = (host, port) => (documentID) => {
  const transport = new TauriWSTransport(`ws://${host}:${port}`)
  const requestManager = new RequestManager([transport])
  const client = new Client(requestManager)
  return peerExtension(0, documentID, client)
}
