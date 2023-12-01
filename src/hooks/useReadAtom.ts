import { Atom } from "jotai"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"

export default function useReadAtom<T>(atom: Atom<T>): () => T {
  return useAtomCallback(useCallback((get) => get(atom), [atom]))
}
