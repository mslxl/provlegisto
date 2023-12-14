import { atom, useAtom, useAtomValue } from "jotai"
import { Doc } from "yjs"
import { signalingServerAtom, whoamiAtom } from "./setting/collab"
import { WebrtcProvider } from "y-webrtc"
import * as log from "tauri-plugin-log-api"
import { generateColorFromString, shadeColor } from "@/lib/utils"

export const collabRoomAtom = atom<string | null>(null)

export const collabDocumentAtom = atom(new Doc())

export const collabProviderAtom = atom<WebrtcProvider | null>(null)

export function useSetupWebRTC() {
  const roomId = useAtomValue(collabRoomAtom)
  const signalingServer = useAtomValue(signalingServerAtom)
  const username = useAtomValue(whoamiAtom)
  const [webrtc, setWebRtc] = useAtom(collabProviderAtom)
  const ydoc = useAtomValue(collabDocumentAtom)

  return (enable: boolean) => {
    if (webrtc != null) {
      webrtc.destroy()
    }
    if(!enable){
      setWebRtc(null)
      return
    }
    if(roomId == null || roomId.length < 4){
      throw new Error('room id length must >= 4')
    }

    const provider = new WebrtcProvider(roomId, ydoc, {
      signaling: [signalingServer],
    })
    const cursorColor = generateColorFromString(username)
    provider.awareness.setLocalStateField("user", {
      name: username,
      color: cursorColor,
      colorLight: shadeColor(cursorColor, 110),
    })
    log.info(`create WebRtc Provider with signal server ${signalingServer} and room ${roomId}`)
    setWebRtc(provider)
  }
}
