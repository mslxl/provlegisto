import { fs, invoke } from "@tauri-apps/api"
import { newTempfile, saveToTempfile } from "./tempfile"

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

export async function runAndCheck(
  language: string,
  src: string,
  args: string[],
  inputData: string,
  expectData: string,
): Promise<string> {
  const inputFrom = await saveToTempfile(inputData, "in.txt")
  const outputTo = await newTempfile()
  await invoke<CheckStatus>("cp_compile_run_src", {
    src: {
      lang: language,
      src,
    },
    compileArgs: args,
    inputFrom,
    outputTo,
  })
  return await fs.readTextFile(outputTo)
}
