import { invoke } from "@tauri-apps/api"
import { LanguageMode } from "@/lib/ipc"

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