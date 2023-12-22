import { atom } from "jotai"
import { atomWithSettings } from "."

export const collabEnableAtom = atomWithSettings("collab.enable", true)

export const collabSignalingServerAtom = atomWithSettings("collab.signal", "ws://127.0.0.1:4444")

export const collabUsernameAtom = atomWithSettings("collab.username", "")
export const collabDisplayNameAtom = atomWithSettings("collab.display", "")
export const collabCookieAtom = atomWithSettings<string>("collab.session", "")
export const collabLoginAtom = atom(async(get)=>{
  const cookie = await get(collabCookieAtom)
  return cookie.length != 0
})
