import { invoke } from "@tauri-apps/api"
import { LanguageMode } from "@/lib/ipc"

export const runDetach = (target: string, mode: LanguageMode, args?: string[]): Promise<void> =>
  invoke("run_detach", {
    target,
    mode,
    args: args ?? [],
  })

export type RunRedirectPASS = {
  type: "PASS"
  output_file: string
  error_file: string
}
export type RunRedirectRE = {
  type: "RE"
  output_file: string
  error_file: string
}
export type RunRedirectTLE = {
  type: "TLE"
}

export type RunRedirectResult = RunRedirectPASS | RunRedirectRE | RunRedirectTLE

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
