import { path, fs } from "@tauri-apps/api"
import * as log from "tauri-plugin-log-api"
import { debounce } from "lodash"
import { map, zip } from "lodash/fp"

/**
 * get dir that source data cache in
 * @returns
 */
async function getDataDir() {
  const filesDir = await path.join(await path.appDataDir(), "files")
  if (!(await fs.exists(filesDir))) {
    await fs.createDir(filesDir)
  }
  return filesDir
}

/**
 * get expected filepath in datadir by source id
 * @param id
 * @returns
 */
async function getFilePath(id: string): Promise<string> {
  const dir = await getDataDir()
  const file = await path.join(dir, `${id}.bin`)
  return file
}

/**
 * create or update cache of source
 * @param src
 */
async function updateCache(id: string, data: ()=>Uint8Array) {
  const file = await getFilePath(id)
  log.info(`update cache ${id} to path ${file}`)
  fs.writeBinaryFile(file, data())
}

const debouncedUpdateCache = debounce(updateCache, 3000, { maxWait: 30 * 1000 })

/**
 * delete source cache if exists
 * @param id
 */
async function dropCache(id: string) {
  const file = await getFilePath(id)
  if (await fs.exists(file)) {
    log.info(`drop cache ${id} (${file})`)
    await fs.removeFile(file)
  }
}

/**
 * delete all source cache
 */
async function dropAll() {
  const dir = await getDataDir()
  const files = await fs.readDir(dir, { recursive: false })
  const tasks = files.map(async (p) => {
    if (p.children == null) {
      await fs.removeFile(p.path)
    }
  })
  await Promise.all(tasks)
}

async function loadFile(file: string): Promise<Uint8Array> {
  return await fs.readBinaryFile(file)
}

interface SerializedSource {
  id: string
  data: Uint8Array
}

async function loadAll(): Promise<SerializedSource[]> {
  const dir = await getDataDir()
  const files = (await fs.readDir(dir, { recursive: false }))
    .filter((p) => p.children == null && p.name != null && p.name.endsWith(".bin"))
    .map((e) => e.path!)

  const tasks = await Promise.all(map(loadFile, files))
  const ids = map((name: string) => name.substring(0, name.lastIndexOf(".bin")), files)
  const construct = (v: [Uint8Array, string]) => ({ data: v[0], id: v[1] }) as SerializedSource
  return map((v) => construct(v as [Uint8Array, string]), zip(tasks, ids))
}

export default {
  loadAll,
  dropAll,
  dropCache,
  updateCache,
  debouncedUpdateCache,
}
