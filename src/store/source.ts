import { LanguageMode } from "@/lib/ipc"
import { Test } from "./testcase"
import { atom, useSetAtom } from "jotai"
import { splitAtom } from "jotai/utils"
import { useImmerAtom } from "jotai-immer"
import { crc16 } from "crc"
import { v4 as uuidv4 } from "uuid"

export type SourceId = string

export type SourceHeader = {
  id: SourceId
  title: string
}

export type Source = {
  url?: string
  path?: string
  contest?: string
  id: SourceId
  remote?: boolean
  code: SourceCode
  test: Test
}

export function emptySource(language: LanguageMode): Source {
  return {
    id: uuidv4(),
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
  [key: SourceId]: boolean
}

type SourceStore = {
  [key: SourceId]: Source
}

const activeIdInternalAtom = atom<SourceId | null>(null)
activeIdInternalAtom.debugLabel = "source.active.internal"

export const activeIdAtom = atom(
  (get) => {
    let headers = get(sourceIndexAtoms)
    if (headers.length == 0) return null
    let id = get(activeIdInternalAtom)
    if (id == null && headers.length != 0) return headers[0].id
    if (id != null && headers.findIndex((p) => p.id == id) == -1) return null
    return id
  },
  (_get, set, value: SourceId | null) => {
    set(activeIdInternalAtom, value)
  },
)
activeIdAtom.debugLabel = "source.active"

export const sourceIndexAtoms = atom<SourceHeader[]>([])
sourceIndexAtoms.debugLabel = "source.index"

export const haveSourceOpenedAtom = atom((get) => {
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
  for (const id of Object.keys(store)) {
    if (store[id].remote) {
      status[id] = false
      continue
    }

    if (store[id].code.savedCrc == undefined) {
      status[id] = store[id].code.source.trim().length != 0
    } else {
      status[id] = store[id].code.savedCrc != crc16(store[id].code.source)
    }
  }
  return status
})

export function useAddSources() {
  const [, setSrc] = useImmerAtom(sourceStoreAtom)
  const dispatch = useSetAtom(sourceIndexAtomAtoms)

  return (sources: { title: string; source: Source }[]) => {
    for (let src of sources) {
      setSrc((prev) => {
        prev[src.source.id] = src.source
      })
      dispatch({
        type: "insert",
        value: {
          id: src.source.id,
          title: src.title,
        },
      })
    }
  }
}
