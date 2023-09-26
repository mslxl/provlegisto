import { type Compartment } from "@codemirror/state"
import { type EditorView } from "codemirror"
interface ThemeDef {
  name: string
  dark: boolean
  theme: () => Promise<any>
}

export async function setTheme(theme: ThemeDef, editor: EditorView, compartment: Compartment): Promise<void> {
  const themeExt = await theme.theme()
  editor.dispatch({
    effects: compartment.reconfigure(themeExt),
  })
}
