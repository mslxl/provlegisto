import { atomWithSettings } from "."

export const zoomStateAtom = atomWithSettings("zoom", 1.0)

export const editorFontSizeAtom = atomWithSettings("editor.fontsize", 16)
export const editorFontFamily = atomWithSettings("editor.font", '"JetBrains Mono", system-ui, -apple-system')
