import { invoke } from "@tauri-apps/api"
import { type SettingsState } from "../store/settings"

export async function compileFile(language: string, src: string, settings: SettingsState): Promise<string> {
  return await invoke("cp_compile_src", {
    src: {
      lang: language,
      src,
    },
    settings,
  })
}

export async function runDetached(language: string, src: string, settings: SettingsState): Promise<string> {
  return await invoke("cp_run_detached_src", {
    src: {
      lang: language,
      src,
    },
    settings,
  })
}

export interface CheckerMessage {
  status: CheckStatus
  message: string
}

export interface RunCodeMessage {
  status: ExecuatorStatus
  message: string
  output?: string
}

export enum ExecuatorStatus {
  PASS = "PASS",
  TLE = "TLE",
  RE = "RE",
  MLE = "MLE",
}

export async function runCode(
  language: string,
  src: string,
  inputFile: string,
  settings: SettingsState,
  timeLimits?: number,
): Promise<RunCodeMessage> {
  const outputFile = await invoke<RunCodeMessage>("cp_compile_run_src", {
    src: {
      lang: language,
      src,
    },
    settings,
    inputFile,
    timeLimits,
  })
  return outputFile
}

export enum CheckStatus {
  UKE = "UKE",
  AC = "AC",
  WA = "WA",
}

export async function runChecker(
  checker: string,
  inputFile: string,
  outputFile: string,
  answerFile: string,
  settings: SettingsState,
): Promise<CheckerMessage> {
  const checkerMessage = await invoke<CheckerMessage>("cp_run_checker", {
    checker,
    inputFile,
    outputFile,
    answerFile,
    settings,
  })
  return checkerMessage
}
