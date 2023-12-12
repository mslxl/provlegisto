import { noPeer, peer } from "@/components/codemirror/peer"
import Client from "@open-rpc/client-js"
import { atom } from "jotai"

export const hostPortAtom = atom(0)
hostPortAtom.debugLabel = "collab.port"

export const hostIPAtom = atom("127.0.0.1")
hostIPAtom.debugLabel = "collab.host"

export const hostingAtom = atom(false)
hostingAtom.debugLabel = "collab.server"

export const connectionAtom = atom<Client|null>(null)
connectionAtom.debugLabel = "collab.connect"

export const collaAtom = atom(async(get) => {
  const client = get(connectionAtom)
  if(client == null) return false
  try{
    return await client.request({method: 'ping'}) != null
  }catch {
    return false
  }
})

export const peerExtensionAtom = atom(async(get) => {
  const connection = get(connectionAtom)
  const isConnected = await get(collaAtom)
  if (isConnected) {
    return peer(connection!)
  } else {
    return noPeer()
  }
})
