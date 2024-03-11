import { Source } from "@/store/source/model"
import { addIndex, forEach, map, range } from "ramda"
import { LanguageMode } from "../ipc"

export interface StaticTestData {
  readonly input: string
  readonly except: string
}

export interface StaticSourceData {
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

export function fromSource(source: Source): StaticSourceData {
  return {
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
 * @param data 
 * @param source 
 */
export function intoSource(data: StaticSourceData, source: Source) {
  source.url = data.url
  source.contestUrl = data.contestUrl
  source.private = data.private
  source.language = data.language as LanguageMode
  source.source.delete(0, source.source.length)
  source.source.insert(0, data.source)
  source.timelimit = data.timelimit ?? 5000 // TODO: set default value by config
  source.memorylimit = data.memorylimit ?? 128 // TODO: set default value by config
  source.checker = data.checker ?? "wcmp"

  source.deleteTest(0, source.testsLength)
  for (let i = 0; i < data.tests.length; i++) source.pushEmptyTest()
  addIndex(map)((v, index) => {
    const test = v as StaticTestData
    const sharedCase = source.getTest(index)
    sharedCase.input.delete(0, sharedCase.input.length)
    sharedCase.except.delete(0, sharedCase.except.length)
    sharedCase.input.insert(0, test.input)
    sharedCase.except.insert(0, test.except)
  }, data.tests)
}
