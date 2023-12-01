export type Test = {
  timeLimits: number
  memoryLimits: number
  checker: string
  testcases: TestCase[]
}
export type TestCase = {
  input: string
  output: string
}

export function emptyTestcase(): TestCase {
  return {
    input: "",
    output: "",
  }
}
