import { atom } from "jotai"

export type LocalSourceMetadata = {
  pathname: string
  crc16: number
}

export const localSourceMetaStoreAtom = atom<Map<string, LocalSourceMetadata>>(new Map<string, LocalSourceMetadata>())

export const getSourceMetaAtom = atom(null, (get, _, id: string) => {
  return get(localSourceMetaStoreAtom).get(id)
})

export const hasSourceMetaAtom = atom(null, (get, _, id: string)=>{
    return get(localSourceMetaStoreAtom).has(id)
})

export const setSourceMetaAtom = atom(null, (get, set, id: string, value: LocalSourceMetadata) => {
  const newVal = new Map([[id, value], ...get(localSourceMetaStoreAtom)])
  set(localSourceMetaStoreAtom, newVal)
})
