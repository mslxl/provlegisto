import { Extension } from "@codemirror/state"
import peerExtension from "./extension/peerExetnsion"
import Client, { RequestManager, WebSocketTransport } from "@open-rpc/client-js"

export type PeerProvider = () => (host: string, port: number, documentID: number) => Extension

export const noPeer: PeerProvider = () => () => []

export const peer: PeerProvider = () => (host, port, documentID) => {
  const transport = new WebSocketTransport(`ws://${host}:${port}`)
  const requestManager = new RequestManager([transport])
  const client = new Client(requestManager)
  return peerExtension(0, documentID, client)
}
