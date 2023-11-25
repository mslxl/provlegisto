import { invoke } from "@tauri-apps/api"
import { CompilerOptions, LanguageMode } from "@/lib/ipc"

type ExternalChecker = {
  type: "External"
  mode: LanguageMode
  source: string
  compiler_options: CompilerOptions
  suggest_output_path?: string
}

export const availableInternalChecker = ["wcmp", "ncmp" , "ncmp9" , "rcmp" , "rcmp4" , "rcmp6" , "yesno"]
type InternalChecker = {
  type: "Internal"
  name: typeof availableInternalChecker[number]
}


export type CheckerType = ExternalChecker | InternalChecker

export type CheckResult =
  | {
      type: "AC"
    }
  | { type: "WA"; report: string }
  | { type: "CheckerInt" }
  | { type: "CheckerCE" }

export const checkAnswer = (
  checker: CheckerType,
  inputFile: string,
  expectFile: string,
  outputFile: string,
): Promise<CheckResult> =>
  invoke("check_answer", {
    checker,
    inputFile,
    expectFile,
    outputFile,
  })

export const abortAllChecker = (): Promise<void> => invoke("abort_all_checker")
