import { LanguageMode } from "@/lib/ipc"
import { Test } from "./testcase"
import { atom, useAtom, useSetAtom } from "jotai"
import { atomWithReducer, splitAtom } from "jotai/utils"
import { useImmerAtom } from "jotai-immer"
import { crc16 } from "crc"
import {v4 as uuidv4} from 'uuid'

export type SourceHeader = {
  id: number
  title: string
}

export type Source = {
  url?: string
  path?: string
  contest?: string
  uuid: string
  remote?: boolean
  code: SourceCode
  test: Test
}

export function emptySource(language: LanguageMode): Source {
  return {
    uuid: uuidv4(),
    code: {
      language,
      source: "",
    },
    test: {
      timeLimits: 3000,
      memoryLimits: 256,
      checker: "wcmp",
      testcases: [],
    },
  }
}

export type SourceCode = {
  language: LanguageMode
  savedCrc?: number
  source: string
}

type SourceChangedStatus = {
  [key: number]: boolean
}

type SourceStore = {
  [key: number]: Source
}

const activeIdInternalAtom = atom(-1)
activeIdInternalAtom.debugLabel = "source.active.internal"

export const activeIdAtom = atom(
  (get) => {
    let headers = get(sourceIndexAtoms)
    if (headers.length == 0) return -1
    let id = get(activeIdInternalAtom)
    if (id == -1 && headers.length != 0) return headers[0].id
    if (id != -1 && headers.findIndex((p) => p.id == id) == -1) return -1
    return id
  },
  (_get, set, value: number) => {
    set(activeIdInternalAtom, value)
  },
)
activeIdAtom.debugLabel = "source.active"

export const counterAtom = atomWithReducer(0, (prev, value: number | undefined) => {
  if (value == undefined) return prev + 1
  return prev + value
})
counterAtom.debugLabel = "source.counter"

export const sourceIndexAtoms = atom<SourceHeader[]>([])
sourceIndexAtoms.debugLabel = "source.index"

export const haveSourceOpenedAtom = atom((get)=>{
  return get(sourceIndexAtoms).length != 0
})
haveSourceOpenedAtom.debugLabel = "source.haveOpen"

export const sourceIndexAtomAtoms = splitAtom(sourceIndexAtoms)
sourceIndexAtoms.debugLabel = "source.indexSplit"

export const sourceStoreAtom = atom<SourceStore>({})
sourceStoreAtom.debugLabel = "source.store"

export const sourceCodeChangedAtom = atom<SourceChangedStatus>((get) => {
  const store = get(sourceStoreAtom)
  let status: SourceChangedStatus = {}
  for (const k of Object.keys(store)) {
    let id = parseInt(k)
    if(store[id].remote){
      status[id] = false
      continue
    }

    if(store[id].code.savedCrc == undefined){
      status[id] = store[id].code.source.trim().length != 0
    }else{
      status[id] = store[id].code.savedCrc != crc16(store[id].code.source)
    }
  }
  return status
})

export function useAddSources() {
  const [, setSrc] = useImmerAtom(sourceStoreAtom)
  const [counter, incCounter] = useAtom(counterAtom)
  const dispatch = useSetAtom(sourceIndexAtomAtoms)

  return (sources: { title: string; source: Source }[]) => {
    for (let i = 0; i < sources.length; i++) {
      let cnt = counter + i
      setSrc((prev) => {
        prev[cnt] = sources[i].source
      })
      dispatch({
        type: "insert",
        value: {
          id: cnt,
          title: sources[i].title,
        },
      })
    }
    incCounter(sources.length)
  }
}
