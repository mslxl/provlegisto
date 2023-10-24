import { vim } from "@replit/codemirror-vim"
import { emacs } from "@replit/codemirror-emacs"
import { type EditorView } from "@codemirror/view"
import { type Compartment } from "@codemirror/state"
export const basicKeymapDict: any = {
  vim,
  emacs,
  normal: [],
}

export function setCursorKeymap(name: string, editor: EditorView, compartment: Compartment): void {
  if (basicKeymapDict[name] !== undefined) {
    editor.dispatch({
      effects: compartment.reconfigure(basicKeymapDict[name]()),
    })
  } else {
    editor.dispatch({
      effects: compartment.reconfigure([]),
    })
  }
}
