import { getSystemName } from "@/lib/ipc/host"
import { atom } from "jotai"

export const systemNameAtom = atom(async () => {
  return getSystemName()
})