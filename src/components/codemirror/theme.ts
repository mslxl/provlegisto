import { Extension } from "@codemirror/state"
import { atom } from "jotai"
import { capitalize, concat, map, sortedUniqBy } from "lodash"

export type ThemeProvider = () => Promise<() => Extension>

async function themeListItem() {
  const list = await themeList()
  return map(list, ([v]) => ({
    key: v,
    value: capitalize(v),
  }))
}

export const themeListItemAtom = atom(async () => {
  return await themeListItem()
})

export async function getThemeExtension(name: string) {
  const list = await themeList()
  const ext = list.find(([k]) => k == name)
  if (ext) {
    return () => ext[1]()
  }
  return await vanilla()
}

const vanilla: ThemeProvider = async () => {
  return () => []
}

async function themeList() {
  const thememirror: [string, () => Extension][] = map(await themeMirror(), ([k, v]) => [k, () => v])
  const uiw: [string, () => Extension][] = map(await themeUiw(), ([k, v]) => [k, () => v])
  const origin: [string, () => Extension][] = [["vanilla", await vanilla()]]
  return sortedUniqBy(
    concat(uiw, thememirror, origin).sort(([a], [b]) => a.localeCompare(b)),
    ([v]) => v,
  )
}

async function themeMirror(): Promise<[string, Extension][]> {
  const themes = await import("thememirror")
  return Object.keys(themes)
    .filter((key) => typeof (themes as any)[key] != "function")
    .map((key) => [key, (themes as any)[key]])
}
async function themeUiw(): Promise<[string, Extension][]> {
  const themes = await import("@uiw/codemirror-themes-all")
  return Object.keys(themes)
    .filter((key) => typeof (themes as any)[key] != "function")
    .filter((key) => !key.toLowerCase().startsWith("default"))
    .map((key) => [key, (themes as any)[key]])
}
