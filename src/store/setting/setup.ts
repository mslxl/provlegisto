import { atom } from "jotai"
import { atomWithSettings } from "."
import { getHostname } from "@/lib/ipc/host"
import { LanguageMode } from "@/lib/ipc"
import { captureOutput } from "@/lib/ipc/setup"
import * as log from "tauri-plugin-log-api"
import { PrefSelectItem } from "@/components/pref/Select"
import { loadable } from "jotai/utils"

export const hostnameAtom = atom(() => getHostname())
export const setupDeviceAtom = atomWithSettings("setup", "")

const internalDefaultLanguageAtom = atomWithSettings("setup.language", LanguageMode.CXX)
export const defaultLanguageAtom = atom(async (get)=> {
  const lang = await get(internalDefaultLanguageAtom)
  const cxxEnable = await get(enableCxxAtom)
  const pyEnable = await get(enablePythonAtom)

  if(lang == LanguageMode.CXX && cxxEnable) return LanguageMode.CXX
  if(lang == LanguageMode.PY && pyEnable) return LanguageMode.PY
  return null
}, (_get, set, value: LanguageMode)=>{
  set(internalDefaultLanguageAtom, value)
})

defaultLanguageAtom.debugLabel = "settings.setup.language.export"

export const enableCxxAtom = atomWithSettings("setup.cxx", true)
export const gccPathAtom = atomWithSettings("gcc.path", "g++")

export const gccVersionAtom = atom(async (get) => {
  const path = await get(gccPathAtom)
  if (path.length == 0) return null
  try {
    const output = await captureOutput(path, ["--version"])
    const version = output.stdout.split("\n")[0]
    return version
  } catch (e) {
    log.error(JSON.stringify(e))
    return null
  }
})

export const clangdPathAtom = atomWithSettings("clangd.path", "clangd")
export const clangdVersionAtom = atom(async (get) => {
  const path = await get(clangdPathAtom)
  if (path.length == 0) return null
  try {
    const output = await captureOutput(path, ["--version"])
    return output.stdout
  } catch (e) {
    log.error(JSON.stringify(e))
    return null
  }
})

export const enablePythonAtom = atomWithSettings("setup.python", false)
export const pythonPathAtom = atomWithSettings("python.path", "python")
export const pythonVersionAtom = atom(async (get) => {
  const path = await get(pythonPathAtom)
  if (path.length == 0) return null
  try {
    const output = await captureOutput(path, ["--version"])
    return output.stdout
  } catch (e) {
    log.error(JSON.stringify(e))
    return null
  }
})

export const pyrightsPathAtom = atomWithSettings("pyrights.path", "pyright-langserver")
export const pyrightsVersionAtom = atom(async (get) => {
  const path = await get(pyrightsPathAtom)
  if (path.length == 0) return null
  try {
    await captureOutput(path, ["--version"])
    return "Pyrights installed"
  } catch (e) {
    log.error(JSON.stringify(e))
    return null
  }
})

export const availableLanguageListAtom = loadable(
  atom(async (get) => {
    const enableCXX = await get(enableCxxAtom)
    const enablePY = await get(enablePythonAtom)
    let list: PrefSelectItem[] = []
    if (enableCXX) list.push({ key: LanguageMode.CXX, value: "C++" })
    if (enablePY) list.push({ key: LanguageMode.PY, value: "Python" })
    return list
  }),
)
