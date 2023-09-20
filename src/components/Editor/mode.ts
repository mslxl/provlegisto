import type { EditorView } from "codemirror"
import { Compartment } from "@codemirror/state"
import { StreamLanguage } from "@codemirror/language"
import { map } from "ramda"
import { languageServer } from "codemirror-languageserver"

export enum Mode {
  c = "cpp",
  cpp = "cpp",
  java = "java",
  python = "python",
  go = "go",
  default = cpp,
}
const LOCAL_LSP_ADAPTER_ADDR = "ws://127.0.0.1:3000"

const modeTable = {
  cpp: {
    syntax: async () => (await import("@codemirror/lang-cpp")).cpp,
    extension: ".cpp",
    lsp: (id: string) =>
      languageServer({
        serverUri: (LOCAL_LSP_ADAPTER_ADDR + `/clangd/${id}`) as any,
        rootUri: "file:///",
        documentUri: "file:///a",
        languageId: "cpp",
        workspaceFolders: null,
      }),
  },
  python: {
    syntax: async () => (await import("@codemirror/lang-python")).python,
    extension: ".py",
    lsp: undefined,
  },
  java: {
    syntax: async () => (await import("@codemirror/lang-java")).java,
    extension: ".java",
    lsp: undefined,
  },
  go: {
    syntax: async () => {
      const go = (await import("@codemirror/legacy-modes/mode/go")).go
      return () => StreamLanguage.define(go)
    },
    extension: ".go",
    lsp: undefined,
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
export const languageServerSupport = new Compartment()

export async function setMode(mode: Mode, editor: EditorView, id: string): Promise<void> {
  console.log(`use ${mode} language support`)
  const language = modeTable[mode]
  const support = await language.syntax()
  editor.dispatch({
    effects: languageSupport.reconfigure(support()),
  })
  // 应用 lsp
  if (language.lsp !== undefined) {
    editor.dispatch({
      effects: languageServerSupport.reconfigure(language.lsp(id)),
    })
  } else {
    editor.dispatch({
      effects: languageServerSupport.reconfigure([]),
    })
  }
}
