import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { filter, map } from "lodash"

type ItemHeader = {
  id: number
  text: string
}

export const tabHeader = atom<ItemHeader[]>([])
tabHeader.debugLabel = "TabHeaders"

export const sourcePath = atom<Map<number, string>>(new Map())
sourcePath.debugLabel = "Source Path"

export const activeTabId = atom(-1)
activeTabId.debugLabel = "Active Tab Id"

export const idCounter = atom(0)
idCounter.debugLabel = "Used Tab Id"

export const sourcesCode = atom(new Map<number, string>())
sourcesCode.debugLabel = "Source Code Map"

export const sourcesCodeChanged = atom(new Map<number, boolean>())
sourcesCodeChanged.debugLabel = "Is Source Code Changed"

export function useMoveTabIndexHandle(): (from: number, to: number) => void {
  const set = useSetAtom(tabHeader)
  return (from, to) => {
    set((data) => {
      const mid = data[to]
      data[to] = data[from]
      data[from] = mid
      return data
    })
  }
}

export function useAddTabHandle(): (title: string) => number {
  const [counter, setCounter] = useAtom(idCounter)
  const setHead = useSetAtom(tabHeader)
  const setActive = useSetAtom(activeTabId)
  const setSourcesCodeMap = useSetAtom(sourcesCode)
  const setSourcesCodeChangedMap = useSetAtom(sourcesCodeChanged)

  return (title) => {
    setHead((head) => [
      ...head,
      {
        id: counter,
        text: title,
      },
    ])

    setSourcesCodeMap((sourcesCodeMap) => new Map([...sourcesCodeMap, [counter, ""]]))
    setSourcesCodeChangedMap((sourcesCodeChangedMap) => new Map([...sourcesCodeChangedMap, [counter, false]]))

    setActive((active) => (active == -1 ? counter : active))
    setCounter(counter + 1)
    return counter
  }
}

export function useSetTabNameHandle(): (id: number, title: string) => void {
  const set = useSetAtom(tabHeader)
  return (id, title) => {
    set((data) => map(data, (e) => (e.id != id ? e : { id: e.id, text: title })))
  }
}

export function useSetSourcesCode(): (id: number, content: string) => void {
  const setData = useSetAtom(sourcesCode)
  return (id, content) => {
    setData((data) => new Map([...data, [id, content]]))
  }
}
export function useGetSourcesCode(): (id: number) => string {
  const data = useAtomValue(sourcesCode)
  return (id) => {
    return data.get(id) ?? ""
  }
}

export function useRemoveSourceCode(): (id: number) => void {
  const [head, setHead] = useAtom(tabHeader)
  const setActive = useSetAtom(activeTabId)
  const setSourcesCodeMap = useSetAtom(sourcesCode)
  const setSourcesCodeChangedMap = useSetAtom(sourcesCodeChanged)

  return (id) => {
    if (head.length == 1) setActive(-1)
    else {
      let idx = head.findIndex((e) => e.id == id)!
      if (idx == 0) setActive(head[1].id)
      else setActive(head[idx - 1].id)
    }
    setHead(filter(head, (e: ItemHeader) => e.id != id))
    setSourcesCodeMap((sourcesCodeMap) => new Map(filter([...sourcesCodeMap], (e: [number, string]) => e[0] != id)))
    setSourcesCodeChangedMap(
      (sourcesCodeChangedMap) => new Map(filter([...sourcesCodeChangedMap], (e: [number, boolean]) => e[0] != id)),
    )
  }
}
