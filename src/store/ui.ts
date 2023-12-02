import { atom } from "jotai"

export const primaryPanelShowAtom = atom<string | null>(null)
export const statusBarShowAtom = atom(false)