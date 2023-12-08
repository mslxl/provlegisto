import { LanguageMode } from "@/lib/ipc"
import { Test } from "./testcase"
import { atom, useAtom, useSetAtom } from "jotai"
import { atomWithReducer, splitAtom } from "jotai/utils"
import { useImmerAtom } from "jotai-immer"

export type SourceHeader = {
  id: number
  title: string
}

export type Source = {
  url?: string
  path?: string
  contest?: string
  code: SourceCode
  test: Test
}

export function emptySource(language: LanguageMode): Source {
  return {
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

export const sourceIndexAtomAtoms = splitAtom(sourceIndexAtoms)
sourceIndexAtoms.debugLabel = "source.indexSplit"

export const sourceStoreAtom = atom<SourceStore>({})
sourceIndexAtoms.debugLabel = "source.store"

export const sourceCodeChangedAtom = atom<SourceChangedStatus>({})

export function useAddSource() {
  const [, setSrc] = useImmerAtom(sourceStoreAtom)
  const [, setChange] = useImmerAtom(sourceCodeChangedAtom)
  const [counter, incCounter] = useAtom(counterAtom)
  const dispatch = useSetAtom(sourceIndexAtomAtoms)

  return (title: string, source: Source) => {
    setSrc((prev) => {
      prev[counter] = source
    })
    setChange((prev)=>{
      prev[counter] = false
    })

    dispatch({
      type: "insert",
      value: {
        id: counter,
        title,
      },
    })
    incCounter()
  }
}
