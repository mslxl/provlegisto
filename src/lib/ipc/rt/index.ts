import { RunRedirectTLE, RunRedirectPASS, RunRedirectRE, runRedirect } from "./runner"
import { CheckResult, CheckerType, checkAnswer } from "./checker"
import { CompileError, CompilerOptions, compileSource } from "./compiler"
import { LanguageMode } from ".."
import { fs, path } from "@tauri-apps/api"

export * from "./checker"
export * from "./compiler"
export * from "./runner"

// type mapped from Compiler
type CRCResultCE = {
  [Property in keyof CompileError as Exclude<Property, "type">]: CompileError[Property]
} & { type: "CE" }

type CRCResultAC = {
  [Property in keyof CheckResult as Exclude<Property, "type">]: CheckResult[Property]
} & {
  [Property in keyof RunRedirectPASS as Exclude<Property, "type">]: RunRedirectPASS[Property]
} & {
  type: "AC"
}
type CRCResultWA = {
  [Property in keyof CheckResult as Exclude<Property, "type">]: CheckResult[Property]
} & {
  [Property in keyof RunRedirectPASS as Exclude<Property, "type">]: RunRedirectPASS[Property]
} & {
  type: "WA"
  report: string
}

type CRCResultINT = {
  type: "INT"
}

type CRCResult = CRCResultCE | RunRedirectRE | RunRedirectTLE | CRCResultAC | CRCResultWA | CRCResultINT
export async function compileRunCheck(
  mode: LanguageMode,
  source: string,
  taskId: string,
  input: string,
  expect: string,
  checker: CheckerType,
  timeout?: number,
  compilerOptions?: CompilerOptions,
  suggestOutputPath?: string,
  additionArgs?: string[],
): Promise<CRCResult> {
  const compileResult = await compileSource(mode, source, compilerOptions, suggestOutputPath)
  // compile fail
  if (compileResult.type == "Error") {
    return {
      type: "CE",
      data: compileResult.data,
    }
  }
  let executableFile = compileResult.data
  let runResult = await runRedirect(mode, taskId, executableFile, input, timeout, additionArgs)
  // execuate TLE or RE
  if (runResult.type != "PASS") {
    return runResult
  }

  // check answer is WA or AC
  let inputFilepath = await path.join(await path.dirname(runResult.output_file), `task${taskId}-input.txt`)
  let expectFilepath = await path.join(await path.dirname(runResult.output_file), `task${taskId}-expect.txt`)
  await fs.writeFile(inputFilepath, input)
  await fs.writeFile(expectFilepath, expect)

  let checkResult = await checkAnswer(checker, inputFilepath, expectFilepath, runResult.output_file)
  if (checkResult.type == "CheckerCE" || checkResult.type == "CheckerInt") {
    return {
      type: "INT",
    }
  }
  if (checkResult.type == "AC") {
    return {
      ...runResult,
      ...checkResult,
      type: checkResult.type,
    }
  }
  return {
    ...runResult,
    ...checkResult,
    type: checkResult.type,
  }
}
