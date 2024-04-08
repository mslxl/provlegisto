import { fs, path } from "@tauri-apps/api"

async function sessionFile(): Promise<string> {
  const dir = await path.appDataDir()
  const file = await path.join(dir, "session")
  return file
}

export async function saveSession(data: Uint8Array) {
  const file = await sessionFile()
  fs.writeBinaryFile(file, data)
}

export async function readSession(): Promise<Uint8Array | null> {
  const file = await sessionFile()
  if (!(await fs.exists(file))) {
    return null
  }
  return await fs.readBinaryFile(file)
}
