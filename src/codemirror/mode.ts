import type { EditorView } from "codemirror"
import { type Compartment } from "@codemirror/state"
import { StreamLanguage } from "@codemirror/language"
import { map } from "ramda"
import { languageServer } from "codemirror-languageserver"
import { useEditorStore } from "../store/editor"

export enum Mode {
  c = "cpp",
  cpp = "cpp",
  java = "java",
  python = "python",
  go = "go",
  default = cpp,
}

function getLSPAdapterAddr(): string {
  const port = useEditorStore().lspPort
  return `ws://127.0.0.1:${port}`
}

const modeTable = {
  cpp: {
    syntax: async () => (await import("@codemirror/lang-cpp")).cpp,
    extension: ".cpp",
    lsp: (id: string) =>
      languageServer({
        serverUri: (getLSPAdapterAddr() + `/clangd/${id}`) as any,
        rootUri: "file:///",
        documentUri: `file:///${id}`,
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

export async function setMode(
  mode: Mode,
  editor: EditorView,
  id: string,
  languageCompartment: Compartment,
  lspCompartment?: Compartment,
): Promise<void> {
  console.log(`use ${mode} language support`)
  const language = modeTable[mode]
  const support = await language.syntax()
  editor.dispatch({
    effects: languageCompartment.reconfigure(support()),
  })
  // 应用 lsp
  if (lspCompartment !== undefined) {
    if (language.lsp !== undefined) {
      editor.dispatch({
        effects: lspCompartment.reconfigure(language.lsp(id)),
      })
    } else {
      editor.dispatch({
        effects: lspCompartment.reconfigure([]),
      })
    }
  }
}
