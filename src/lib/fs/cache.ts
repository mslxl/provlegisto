import { path, fs } from "@tauri-apps/api"
import * as log from "tauri-plugin-log-api"
import { StaticSourceData } from "./model"
import { debounce } from "lodash"

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
  const file = await path.join(dir, `${id}.src.json`)
  return file
}

/**
 * create or update cache of source
 * @param src 
 */
async function updateCache(id: string, src: ()=>StaticSourceData) {
  const file = await getFilePath(id)
  log.info(`update cache ${id} to path ${file}`)
  fs.writeTextFile(file, JSON.stringify(src()))
}

const debouncedUpdateCache = debounce(updateCache, 1000, {maxWait: 30*1000})

/**
 * delete source cache if exists
 * @param id 
 */
async function dropCache(id: string) {
  const file = await getFilePath(id)
  if ((await fs.exists(file))) {
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


/**
 * 
 * @param file 
 * @returns 
 */
async function loadFile(file: string): Promise<StaticSourceData> {
  const content = await fs.readTextFile(file)
  const obj = JSON.parse(content)
  return obj 
}

async function loadAll(): Promise<StaticSourceData[]> {
  const dir = await getDataDir()
  const files = (await fs.readDir(dir, { recursive: false }))
    .filter((p) => p.children == null && p.name != null && p.name.endsWith(".src.json"))
    .map((e) => e.path!)

  const tasks = files.map(loadFile)
  return await Promise.all(tasks)
}

export default {
  loadAll,
  dropAll,
  dropCache,
  updateCache,
  debouncedUpdateCache,
}
