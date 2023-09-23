import { invoke } from "@tauri-apps/api"

export async function compileFile(language: string, file: string, args: string[]): Promise<string> {
  return await invoke("cp_compile_file", {
    src: {
      lang: language,
      filename: file,
    },
    compileArgs: args,
  })
}

export async function runDetached(language: string, file: string, args: string[]): Promise<string> {
  return await invoke("cp_run_detached", {
    src: {
      lang: language,
      filename: file,
    },
    compileArgs: args,
  })
}
