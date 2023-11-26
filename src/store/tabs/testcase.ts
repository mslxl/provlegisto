import { atom, useAtom } from "jotai"

export type Testcase = {
  input: string
  output: string
}

export const testcases = atom(new Map<number, Testcase[]>())
testcases.debugLabel = "Testcases"

export const testcasesChecker = atom(new Map<number, string>())
testcasesChecker.debugLabel = "Testcase Checker"

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