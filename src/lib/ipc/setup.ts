import { invoke } from "@tauri-apps/api"

export const whichBinary: (name: string) => Promise<string | undefined> = (name) => invoke("which", { name: name })

export type OutputCapture = {
  exitCode: number
  stdout: string
  stderr: string
}
export const captureOutput: (program: string, args: string[]) => Promise<OutputCapture> = (program, args) =>
  invoke("capture_output", {
    program,
    args,
  })

export const execuatePwshScript = (name: string) => invoke<string>("execuate_pwsh_script", { name })
