import { atom } from "jotai"

export type PrimaryPanelName = 'run' | 'files' | 'collab' | null
export const primaryPanelShowAtom = atom<PrimaryPanelName>(null)
export const statusBarShowAtom = atom(false)