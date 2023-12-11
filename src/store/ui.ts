import { atom } from "jotai"

export const primaryPanelShowAtom = atom<string | null>(null)
primaryPanelShowAtom.debugLabel = "ui.side.active"
export const statusBarShowAtom = atom(false)
statusBarShowAtom.debugLabel = "ui.status.enable"