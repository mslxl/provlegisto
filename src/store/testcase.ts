import {v4 as uuidv4} from 'uuid'
export type TestCaseId = string

export type Test = {
  timeLimits: number
  memoryLimits: number
  checker: string
  testcases: TestCase[]
}
export type TestCase = {
  input: string
  output: string
  id: TestCaseId
}

export function emptyTestcase(): TestCase {
  return {
    input: "",
    output: "",
    id: uuidv4()
  }
}
