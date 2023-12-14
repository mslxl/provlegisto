import { random } from "lodash"
import { atomWithSettings } from "."

export const signalingServerAtom = atomWithSettings("collab.signal", "ws://127.0.0.1:4444")

export const whoamiAtom = atomWithSettings("collab.who", `Anonymous-${random(0, 65535)}`)
