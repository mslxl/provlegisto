import { atom, useAtom } from "jotai"
import { filter, map } from "lodash"

type ItemHeader = {
  id: number
  text: string
}

export const tabHeader = atom<ItemHeader[]>([])
tabHeader.debugLabel = "TabHeaders"

export const activeTabId = atom(-1)
activeTabId.debugLabel = "Active Tab Id"

const sourcesCode = atom(new Map<number, string>())
tabHeader.debugLabel = "Source Code Map"

const sourcesCodeChanged = atom(new Map<number, boolean>())
sourcesCodeChanged.debugLabel = "Is Source Code Changed"

type Testcase = {
  input: string
  output: string
}

const testcases = atom(new Map<number, Testcase[]>())
testcases.debugLabel = "Testcases"


const idCounter = atom(0)
idCounter.debugLabel = "Used Tab Id"

const testcasesChecker = atom(new Map<number, string>())
testcasesChecker.debugLabel = "Testcase Checker"

export function useMoveTabIndexHandle(): (from: number, to: number) => void {
  const [data, setData] = useAtom(tabHeader)
  return (from, to) => {
    const mid = data[to]
    data[to] = data[from]
    data[from] = mid
    setData([...data])
  }
}

export function useAddTabHandle(): (title: string) => number {
  const [head, setHead] = useAtom(tabHeader)
  const [counter, setCounter] = useAtom(idCounter)
  const [active, setActive] = useAtom(activeTabId)
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

export function useSetTabNameHandle(): (id: number, title: string) => void {
  const [data, setData] = useAtom(tabHeader)
  return (id, title) => {
    setData(map(data, (e) => (e.id != id ? e : { id: e.id, text: title })))
  }
}

export function useSetSourcesCode(): (id: number, content: string) => void {
  const [data, setData] = useAtom(sourcesCode)
  return (id, content) => {
    setData(new Map([...data, [id, content]]))
  }
}
export function useGetSourcesCode(): (id: number)=>string {
  const [data] = useAtom(sourcesCode)
  return (id) => {
    return data.get(id)!
  }
}

export const useAtomSourcecodeMap = () => useAtom(sourcesCode)[0]
export function useRemoveSourceCode(): (id: number) => void {
  const [head, setHead] = useAtom(tabHeader)
  const [, setActive] = useAtom(activeTabId)
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

// Sourcecode Testcase Below

export function useSetTestcase(): (id: number, idx: number, newInputValue?: string, newOutputValue?: string) => void {
  const [testcase, setTestcase] = useAtom(testcases)
  return (id, idx, newInput, newOutput) => {
    if (newInput == undefined && newOutput == undefined) return
    let testcasesList = testcase.get(id)! ?? []
    testcasesList[idx].input = newInput ?? testcasesList[idx].input
    testcasesList[idx].output = newOutput ?? testcasesList[idx].output
    setTestcase(new Map([...testcase, [id, [...testcasesList]]]))
  }
}
export function useGetTestcase(): (id: number) => Testcase[] {
  const [testcase] = useAtom(testcases)
  return (id) => testcase.get(id)! ?? []
}

export function useDelTestcase(): (id: number, index: number) => void {
  const [testcase, setTestcase] = useAtom(testcases)
  return (id, index) => {
    let testcasesList = testcase.get(id)
    if (testcasesList == undefined) return
    testcasesList.splice(index, 1)
    setTestcase(new Map([...testcase, [id, [...testcasesList]]]))
  }
}

export function useAddTestcase(): (id: number) => number {
  const [testcase, setTestcase] = useAtom(testcases)
  return (id) => {
    let testcasesList = testcase.get(id) ?? []
    testcasesList.push({ input: "", output: "" })
    setTestcase(new Map([...testcase, [id, [...testcasesList]]]))
    return testcasesList.length - 1
  }
}

export function useAddTestcaseList(): (id: number, items: Testcase[]) => void {
  const [testcase, setTestcase] = useAtom(testcases)
  return (id, items)=>{
    let testcasesList = testcase.get(id) ?? []
    testcasesList = [...testcasesList, ...items]
    setTestcase(new Map([...testcase, [id, [...testcasesList]]]))
  }
}

export function useSetChecker(): (id: number, value: string) => void {
  const [checkerMap, setCheckerMap] = useAtom(testcasesChecker)
  return (id, value)=>{
    setCheckerMap(new Map([...checkerMap, [id, value]]))
  }
}

export function useGetChecker(): (id: number) => string {
  const [checkerMap] = useAtom(testcasesChecker)
  return (id)=>{
    if(!checkerMap.has(id)) return "wcmp"
    return checkerMap.get(id)!
  }
}