import { Compartment } from "@codemirror/state"
import { type EditorView } from "codemirror"
interface ThemeDef {
  name: string
  dark: boolean
  theme: () => Promise<any>
}
export const themeCompartment = new Compartment()

export async function setTheme(theme: ThemeDef, editor: EditorView): Promise<void> {
  const themeExt = await theme.theme()
  editor.dispatch({
    effects: themeCompartment.reconfigure(themeExt),
  })
}
