import type { EditorView } from "codemirror"
import { Compartment } from "@codemirror/state"
import { StreamLanguage } from "@codemirror/language"

export enum Mode {
  c = "cpp",
  cpp = "cpp",
  java = "java",
  python = "python",
  go = "go",
  default = cpp,
}

const modeTable = {
  cpp: {
    syntax: async () => (await import("@codemirror/lang-cpp")).cpp,
    extension: ".cpp",
  },
  python: {
    syntax: async () => (await import("@codemirror/lang-python")).python,
    extension: ".py",
  },
  java: {
    syntax: async () => (await import("@codemirror/lang-java")).java,
    extension: ".java",
  },
  go: {
    syntax: async () => {
      const go = (await import("@codemirror/legacy-modes/mode/go")).go
      return () => StreamLanguage.define(go)
    },
    extension: ".go",
  },
}

export const languageSupport = new Compartment()
export async function setMode(mode: Mode, editor: EditorView): Promise<void> {
  const support = await modeTable[mode].syntax()
  editor.dispatch({
    effects: languageSupport.reconfigure(support()),
  })
}
