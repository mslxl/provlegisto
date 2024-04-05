import { Source } from "@/store/source/model"
import { zip, map, range } from "lodash/fp"
import { LanguageMode } from "../ipc"

export interface StaticTestData {
  readonly input: string
  readonly except: string
}

export interface StaticSourceData {
  readonly id: string
  readonly name: string | undefined
  readonly url: string | undefined
  readonly contestUrl: string | undefined
  readonly private: boolean
  readonly language: string
  readonly source: string
  readonly timelimit: number | undefined
  readonly memorylimit: number | undefined
  readonly checker: string | undefined
  readonly tests: StaticTestData[]
}

/**
 * Get data from Yjs
 * this would lost all history info
 * @param source 
 * @returns 
 */
export function intoStaticSource(source: Source): StaticSourceData {
  return {
    id: source.id,
    name: source.name.toString(),
    url: source.url,
    contestUrl: source.contestUrl,
    private: source.private,
    language: source.language,
    source: source.source.toString(),
    timelimit: source.timelimit,
    memorylimit: source.memorylimit,
    checker: source.checker,
    tests: map(
      (index) => {
        const item = source.getTest(index)
        return {
          input: item.input.toString(),
          except: item.except.toString(),
        }
      },
      range(0, source.testsLength),
    ),
  }
}

/**
 * Fill Source with StaticSourceData
 * it's recommend to wrap it in a transact
 *
 * Attation: it would not change the id of source object,
 * if you want to specify its id, use store.create plz
 */
export function fillSource(
  data: StaticSourceData,
  source: Source,
  defaultTimeLimit: number = 5000,
  defaultMemoryLimit: number = 512 * 1024,
) {
  source.url = data.url
  source.contestUrl = data.contestUrl
  source.private = data.private
  source.language = data.language as LanguageMode
  source.source.delete(0, source.source.length)
  source.source.insert(0, data.source)
  if(data.name){
    source.name.delete(0, source.name.length)
    source.name.insert(0, data.name)
  }
  source.timelimit = data.timelimit ?? defaultTimeLimit
  source.memorylimit = data.memorylimit ?? defaultMemoryLimit
  source.checker = data.checker ?? "wcmp"

  source.deleteTest(0, source.testsLength)
  for (let i = 0; i < data.tests.length; i++) source.pushEmptyTest()
  map(
    ([v, index]) => {
      const test = v as StaticTestData
      const sharedCase = source.getTest(index)
      sharedCase.input.delete(0, sharedCase.input.length)
      sharedCase.except.delete(0, sharedCase.except.length)
      sharedCase.input.insert(0, test.input)
      sharedCase.except.insert(0, test.except)
    },
    zip(data.tests, range(0, data.tests.length)),
  )
}