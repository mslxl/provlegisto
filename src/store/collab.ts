import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { Doc } from "yjs"
import { collabSignalingServerAtom } from "./setting/collab"
import { WebrtcProvider } from "y-webrtc"
import { generateColorFromString, shadeColor } from "@/lib/utils"
import { useSignalServerAxios } from "@/hooks/useAxios"
import * as log from "tauri-plugin-log-api"

export const collabRoomIdAtom = atom<number | null>(null)
export const collabSessionUuidAtom = atom<string | null>(null)


export const collabDocumentAtom = atom(new Doc())

export const collabProviderAtom = atom<WebrtcProvider | null>(null)

export function useExitRoom() {
  const [webrtc, setWebRtc] = useAtom(collabProviderAtom)
  const setRoomId = useSetAtom(collabRoomIdAtom)
  return () => {
    if (webrtc != null) {
      webrtc.destroy()
      setWebRtc(null)
      setRoomId(null)
    }
  }
}

type UserProfile = {
  username: string
  displayName: string
  realName: string
  supervisor: boolean
}
export function useFetchProfile() {
  const { axios, loading } = useSignalServerAxios()
  const request = async () => {
    const response = await axios.get("/user/profile")
    const data = response.data
    if (data.status == 0) {
      return {
        status: 0,
        data: data.data as UserProfile,
      }
    }
    return {
      status: data.status as number,
      error: data.error as string,
    }
  }

  return {
    loading,
    requestProfile: request,
  }
}

export function useJoinRoomController() {
  const setRoomId = useSetAtom(collabRoomIdAtom)
  const signalingServer = useAtomValue(collabSignalingServerAtom)
  const setWebRtc = useSetAtom(collabProviderAtom)
  const ydoc = useAtomValue(collabDocumentAtom)
  const { axios, loading } = useSignalServerAxios()
  const exitRoom = useExitRoom()
  const profileFetcher = useFetchProfile()

  const send = async (roomId: number, password?: string) => {
    exitRoom()
    setRoomId(roomId)
    const profileResponse = await profileFetcher.requestProfile()
    if (profileResponse.status != 0) return profileResponse
    const profile = profileResponse.data!

    const data = (await axios.get(`/room/${roomId}`, { params: { password } })).data
    if (data.status != 0) return data

    const uuid = data.data
    const url = new URL(signalingServer)
    const protocal = url.protocol == "http:" ? "ws:" : "wss:"
    const hostPort = `${url.host}:${url.port}`

    const signalingSession = `${protocal}//${hostPort}/session/${uuid}`
    const provider = new WebrtcProvider(roomId.toString(), ydoc, {
      signaling: [signalingSession],
    })

    const cursorColor = generateColorFromString(profile.displayName)
    provider.awareness.setLocalStateField("user", {
      name: profile.displayName,
      color: cursorColor,
      colorLight: shadeColor(cursorColor, 110),
    })
    log.info(`create WebRtc Provider with signal server ${signalingSession} and room ${roomId}`)
    setWebRtc(provider) 
    return {
      status: 0,
      data: {}
    }
  }
  return { send, loading: loading || profileFetcher.loading }
}
