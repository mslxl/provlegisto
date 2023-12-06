import { atom } from "jotai"
import { atomWithSettings } from "."
import { getThemeExtension } from "@/components/codemirror/theme"

export const zoomStateAtom = atomWithSettings("zoom", 1.0)

export const editorThemeAtom = atomWithSettings('editor.theme', 'vanilla')
export const editorThemeExtensionAtom = atom(async(get)=>{
  const theme = await get(editorThemeAtom)
  const ext = await getThemeExtension(theme)
  return ext
})


export const editorFontSizeAtom = atomWithSettings("editor.fontsize", 16)
export const editorFontFamilyAtom = atomWithSettings("editor.font", '"JetBrains Mono", system-ui, -apple-system')
