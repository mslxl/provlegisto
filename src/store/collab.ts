import { noPeer, peer } from "@/components/codemirror/peer"
import { atom } from "jotai"

export const hostPortAtom = atom(0)
hostPortAtom.debugLabel = "collab.port"

export const hostIPAtom = atom("127.0.0.1")
hostIPAtom.debugLabel = "collab.host"

export const hostingAtom = atom(false)
hostingAtom.debugLabel = "collab.server"

export const connectAtom = atom(false)
connectAtom.debugLabel = "collab.connect"

export const collaAtom = atom((get) => get(hostingAtom) || get(connectAtom))

export const peerExtensionAtom = atom((get) => {
  const ip = get(hostIPAtom)
  const port = get(hostPortAtom)
  if (get(collaAtom) && port != 0) {
    return peer(ip, port)
  } else {
    return noPeer(ip, port)
  }
})
