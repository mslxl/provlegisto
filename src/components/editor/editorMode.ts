import type { EditorView } from "codemirror"
import { Compartment } from "@codemirror/state"
import { StreamLanguage } from "@codemirror/language"
import { map } from "ramda"

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

export const allowExtension = map((k) => (modeTable as any)[k].extension, Object.keys(modeTable))
export function getModeByExtension(ext: string): Mode | null {
  if (!ext.startsWith(".")) {
    ext = "." + ext
  }
  for (const k of Object.keys(modeTable)) {
    if ((modeTable as any)[k].extension === ext) {
      return k as Mode
    }
  }
  return null
}
export function getExtensionByMode(mode: Mode): string {
  return (modeTable as any)[mode].extension
}

export const languageSupport = new Compartment()
export async function setMode(mode: Mode, editor: EditorView): Promise<void> {
  console.log(`use ${mode} language support`)
  const support = await modeTable[mode].syntax()
  editor.dispatch({
    effects: languageSupport.reconfigure(support()),
  })
}
