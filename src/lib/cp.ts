import { invoke } from "@tauri-apps/api"

export async function compileFile(language: string, src: string, args: string[]): Promise<string> {
  return await invoke("cp_compile_src", {
    src: {
      lang: language,
      src,
    },
    compileArgs: args,
  })
}

export async function runDetached(language: string, src: string, args: string[]): Promise<string> {
  return await invoke("cp_run_detached_src", {
    src: {
      lang: language,
      src,
    },
    compileArgs: args,
  })
}

export enum CheckStatus {
  UKE = "UKE",
}

export async function runCode(
  language: string,
  src: string,
  args: string[],
  inputFile: string,
  timeLimits?: number,
): Promise<string> {
  const outputFile = await invoke<CheckStatus>("cp_compile_run_src", {
    src: {
      lang: language,
      src,
    },
    compileArgs: args,
    inputFile,
    timeLimits,
  })
  return outputFile
}
