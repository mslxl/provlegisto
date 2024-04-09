import { WebsocketProvider } from "y-websocket"
import { atom } from "jotai"
import { awarenessAtom, awarenessStateAtom, docAtom, syncAwarenessActiveSourceIdAtom } from "."
import * as log from "tauri-plugin-log-api"
import { atomWithObservable } from "jotai/utils"
import { map } from "lodash/fp"
import { normalizeColor } from "@/lib/utils"
import WebsocketTauriPolyfill from "@/lib/net/WebsocketTauriPolyfill"

export const docProviderAtom = atom<null | WebsocketProvider>(null)

type ProviderState = "unconnected" | "connecting" | "connected"
export const docProviderStateAtom = atomWithObservable((get) => {
  const provider = get(docProviderAtom)

  return {
    subscribe(observer: { next: (data: ProviderState) => void }): { unsubscribe: () => void } {
      if (provider) {
        const cb = (v: { status: "disconnected" | "connecting" | "connected" }) => {
          if (v.status == "disconnected") observer.next("unconnected")
          else observer.next(v.status)
        }
        if (provider.wsconnected) {
          observer.next("connected")
        } else {
          observer.next("connecting")
        }
        provider.on("status", cb)
        return {
          unsubscribe: () => provider.off("status", cb),
        }
      } else {
        observer.next("unconnected")
        return { unsubscribe: () => {} }
      }
    },
  }
})

export const disconnectProviderAtom = atom(null, (get, set) => {
  const provider = get(docProviderAtom)
  if (provider) {
    log.info("disconnect manaually")
    provider.destroy()
    set(docProviderAtom, null)
  }
})

export interface UserAwareness {
  name: string
  color: string
}

export interface UserFocusDocId {
  activeId: string
}

export interface UserCursor {
  cursor: string
}

export type OnlineUserInfo = UserAwareness &
  UserFocusDocId &
  (UserFocusDocId | {}) & {
    clientId: number
  }

export const onlineUsersAtom = atom<OnlineUserInfo[]>((get) => {
  const states = get(awarenessStateAtom)
  return map(
    ([clientId, client]) =>
      Object.assign(
        client.user,
        { cursor: client?.cursor?.anchor?.tname },
        { activeId: client.active },
        {
          clientId: clientId,
        },
      ),
    Array.from(states.entries()),
  )
})

export const connectProviderAtom = atom(
  null,
  (get, set, address: string, roomName: string, user?: UserAwareness, retriedTimes: number = 3) => {
    set(disconnectProviderAtom)
    const awareness = get(awarenessAtom)

    const doc = get(docAtom)
    const wsProvider = new WebsocketProvider(address, roomName, doc, {
      WebSocketPolyfill : WebsocketTauriPolyfill as any, // fuck, this is executable, through "anyscript"
      awareness: awareness,
    })
    if (user) {
      wsProvider.awareness.setLocalStateField(
        "user",
        Object.assign(user, {
          colorLight: normalizeColor(user.color) + "cc",
        }),
      )
    }
    // logging
    wsProvider.on("status", ({ status }: { status: string }) => {
      log.info(`provider connection status: ${status}`)
    })
    set(docProviderAtom, wsProvider)

    set(syncAwarenessActiveSourceIdAtom)

    const promise = new Promise<string>((resolve, reject) => {
      let count = 0
      const callback = ({ status }: { status: string }) => {
        if (status == "connected") {
          resolve(status)
          wsProvider.off("status", callback)
        } else {
          count++
          if (count > retriedTimes) {
            set(disconnectProviderAtom)
            reject(status)
            wsProvider.off("status", callback)
          }
        }
      }
      wsProvider.on("status", callback)
    })

    wsProvider.connect()
    return promise
  },
)
