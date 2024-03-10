import { path, fs } from "@tauri-apps/api"
import { Source } from "@/store/source/model"
import * as log from "tauri-plugin-log-api"

async function getDataDir() {
  const filesDir = await path.join(await path.appDataDir(), "files")
  if (!(await fs.exists(filesDir))) {
    await fs.createDir(filesDir)
  }
  return filesDir
}

async function getFilePath(id: number): Promise<string> {
  const dir = await getDataDir()
  const file = await path.join(dir, `${id}.dat`)
  return file
}

export async function updateCache(id: number, title: string, src: Source) {
  const file = await getFilePath(id)
  log.info(`update cache ${id} to path ${file}`)
  fs.writeTextFile(file, JSON.stringify({ src, title }))
}

export async function dropCache(id: number) {
  const file = await getFilePath(id)
  log.info(`drop cache ${id} (${file})`)
  if ((await fs.exists(file))) {
    await fs.removeFile(file)
  }
}

export async function dropAll() {
  const dir = await getDataDir()
  const files = await fs.readDir(dir, { recursive: false })
  const tasks = files.map(async (p) => {
    if (p.children == null) {
      await fs.removeFile(p.path)
    }
  })
  await Promise.all(tasks)
}

async function recoverFromFile(file: string): Promise<[string,Source]> {
  const content = await fs.readTextFile(file)
  const obj = JSON.parse(content)
  return [obj.title, obj.src]
}

export async function recoverAllCache(): Promise<[string, Source][]> {
  const dir = await getDataDir()
  const files = (await fs.readDir(dir, { recursive: false }))
    .filter((p) => p.children == null && p.name != null && p.name.endsWith(".dat"))
    .map((e) => e.path!)

  const tasks = files.map(recoverFromFile)
  return await Promise.all(tasks)
}
