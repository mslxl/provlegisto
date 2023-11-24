import { invoke } from "@tauri-apps/api"
import { LanguageMode } from "."

export type CompilerOptions = {
  path?: string
  args?: string[]
}

export type CompileSuccess = {
  type: "Success"
  data: string
}

export type Lint = {
  position: [number, number]
  ty?: string
  description?: string
}
export type CompileError = {
  type: "Error"
  data: Lint[]
}

export type CompileResult = CompileSuccess | CompileError

export const compileSource = (
  mode: LanguageMode,
  source: string,
  compilerOptions?: CompilerOptions,
  suggestOutputPath?: string,
): Promise<CompileResult> =>
  invoke("compile_source", {
    mode,
    source,
    suggestOutputPath,
    compilerOptions: compilerOptions ? compilerOptions : {},
  })

export const runDetach = (target: string, args?: string[]): Promise<void> =>
  invoke("run_detach", {
    target,
    args: args ?? [],
  })

type RunRedirectPASS = {
  type: "PASS"
  output_file: string
  error_file: string
}
type RunRedirectRE = {
  type: "RE"
  output_file: string
  error_file: string
}
type RunRedirectTLE = {
  type: "TLE"
}

type RunRedirectResult = RunRedirectPASS | RunRedirectRE | RunRedirectTLE

export const runRedirect = (
  mode: LanguageMode,
  taskId: string,
  execTarget: string,
  input: string,
  timeout?: number,
  additionArgs?: string[],
): Promise<RunRedirectResult> =>
  invoke("run_redirect", {
    mode,
    taskId,
    execTarget,
    input,
    timeout: timeout ?? 3000,
    additionArgs: additionArgs ?? [],
  })
