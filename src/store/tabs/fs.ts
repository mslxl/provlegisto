import { fs, path } from "@tauri-apps/api"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { map, zip } from "lodash"
import { Testcase, idCounter, sourcesCode, sourcesCodeChanged, tabHeader, testcases, useGetSourcesCode } from "."

export function useSaveSourceToFile(): (file: string, id: number) => Promise<void> {
  const getSourceCode = useGetSourcesCode()
  const testcase = useAtomValue(testcases)
  const setSourcesCodeChangedMap = useSetAtom(sourcesCodeChanged)

  return async (file, id) => {
    await fs.writeTextFile(file, getSourceCode(id))
    const basename = await path.basename(file, "." + (await path.extname(file)))
    const test = testcase.get(id) ?? []
    console.log(test)
    for (let idx = 1; idx <= test.length; idx++) {
      const workingDir = await path.dirname(file)
      const inFile = await path.join(workingDir, `${basename}_${idx}.in`)
      const outFile = await path.join(workingDir, `${basename}_${idx}.out`)
      console.log(idx, inFile, outFile, test[idx - 1])
      await fs.writeTextFile(inFile, test[idx - 1].input)
      await fs.writeTextFile(outFile, test[idx - 1].output)
    }
    setSourcesCodeChangedMap((data) => new Map([...data, [id, false]]))
  }
}

export function useAddSourceFromFiles(): (files: string[]) => Promise<void> {
  const [counter, setCounter] = useAtom(idCounter)
  const setItemHeader = useSetAtom(tabHeader)
  const setSourceCodeMap = useSetAtom(sourcesCode)
  const setSourcesCodeChangedMap = useSetAtom(sourcesCodeChanged)
  const setTestcase = useSetAtom(testcases)

  return async (files) => {
    const sourecsContent: string[] = []
    const testcases: Testcase[][] = []
    for (const p of files) {
      // read source code
      const text = await fs.readTextFile(p)
      const test: Testcase[] = []
      // TODO: there is a bug if file has no extname!
      const basename = await path.basename(p, "." + (await path.extname(p)))
      const workingDir = await path.dirname(p)
      // find all testcase
      // collect and push its content to testcases array
      for (let idx = 1; true; idx++) {
        const inFile = await path.join(workingDir, `${basename}_${idx}.in`)
        const outFile = await path.join(workingDir, `${basename}_${idx}.out`)
        let v = {
          input: "",
          output: "",
        }
        if (await fs.exists(inFile)) {
          v.input = await fs.readTextFile(inFile)
        }
        if (await fs.exists(outFile)) {
          v.output = await fs.readTextFile(outFile)
        }
        if (v.input.length != 0 || v.output.length != 0) {
          test.push(v)
        } else {
          break
        }
      }
      testcases.push(test)
      sourecsContent.push(text)
    }
    // TODO: parse title from source code
    const titles = map(sourecsContent, (_v, index) => files[index])

    const idArray = map([...Array.from({ length: sourecsContent.length }).keys()], (id) => id + counter)

    setItemHeader((items) => [
      ...items,
      ...map(zip(idArray, titles), ([idx, title]) => ({
        text: title as string,
        id: idx! as number,
      })),
    ])

    setSourceCodeMap((data) => new Map([...data, ...(zip(idArray, sourecsContent) as [number, string][])]))
    setSourcesCodeChangedMap(
      (data) => new Map([...data, ...(map(idArray, (id) => [id, false]) as [number, boolean][])]),
    )

    setTestcase((testcase) => new Map([...testcase, ...(zip(idArray, testcases) as [number, Testcase[]][])]))

    setCounter(counter + sourecsContent.length)
  }
}
