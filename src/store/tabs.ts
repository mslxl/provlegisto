import { atom, useAtom } from "jotai"
import { filter, map } from "lodash"

type ItemHeader = {
  id: number
  text: string
}

export const items = atom<ItemHeader[]>([])
export const sourcesCode = atom(new Map<number, string>())
export const sourcesCodeChanged = atom(new Map<number, boolean>())
export const activeItemId = atom(-1)
const idCounter = atom(0)

export function useMoveItemHandle(): (from: number, to: number) => void {
  const [data, setData] = useAtom(items)
  return (from, to) => {
    const mid = data[to]
    data[to] = data[from]
    data[from] = mid
    setData([...data])
  }
}

export function useAddHandle(): (title: string) => number {
  const [head, setHead] = useAtom(items)
  const [counter, setCounter] = useAtom(idCounter)
  const [active, setActive] = useAtom(activeItemId)
  const [sourcesCodeMap, setSourcesCodeMap] = useAtom(sourcesCode)
  const [sourcesCodeChangedMap, setSourcesCodeChangedMap] = useAtom(sourcesCodeChanged)

  return (title) => {
    setHead([
      ...head,
      {
        id: counter,
        text: title,
      },
    ])

    setSourcesCodeMap(new Map([...sourcesCodeMap, [counter, ""]]))
    setSourcesCodeChangedMap(new Map([...sourcesCodeChangedMap, [counter, false]]))

    if (active == -1) {
      setActive(counter)
    }
    setCounter(counter + 1)
    return counter
  }
}

export function useSetSourcesCodeHandle(): (id: number, content: string) => void {
  const [data, setData] = useAtom(sourcesCode)
  return (id, content) => {
    setData(new Map([...data, [id, content]]))
  }
}

export const useAtomSourceCodeMap = () => useAtom(sourcesCode)[0]

export function useSetTabNameHandle(): (id: number, title: string) => void {
  const [data, setData] = useAtom(items)
  return (id, title) => {
    setData(map(data, (e) => (e.id != id ? e : { id: e.id, text: title })))
  }
}
export function useRemoveHandle(): (id: number) => void {
  const [head, setHead] = useAtom(items)
  const [, setActive] = useAtom(activeItemId)
  const [sourcesCodeMap, setSourcesCodeMap] = useAtom(sourcesCode)
  const [sourcesCodeChangedMap, setSourcesCodeChangedMap] = useAtom(sourcesCodeChanged)

  return (id) => {
    if (head.length == 1) setActive(-1)
    else {
      let idx = head.findIndex((e) => e.id == id)!
      if (idx == 0) setActive(head[1].id)
      else setActive(head[idx - 1].id)
    }
    setHead(filter(head, (e: ItemHeader) => e.id != id))
    setSourcesCodeMap(new Map(filter([...sourcesCodeMap], (e: [number, string]) => e[0] != id)))
    setSourcesCodeChangedMap(new Map(filter([...sourcesCodeChangedMap], (e: [number, boolean]) => e[0] != id)))
  }
}
