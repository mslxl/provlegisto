import { Extension } from "@codemirror/state"
import peerExtension from "./extension/peerExetnsion"
import Client from "@open-rpc/client-js"

export type PeerProvider = (client: Client) => (documentID: number) => Extension

export const noPeer  = () => () => []

export const peer: PeerProvider = (client: Client) => (documentID) => {
  return peerExtension(0, documentID, client)
}
