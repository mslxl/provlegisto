import { languageServer } from "codemirror-languageserver"
import { Extension } from "@codemirror/state"
import { LanguageMode, getLSPServer } from "@/lib/ipc"

export type LspProvider = (ls: string) => Promise<() => Extension>

export const noLsp: LspProvider = async () => {
  return () => []
}

export const cxxLsp: LspProvider = async (ls: string): Promise<() => Extension> => {
  const highlight = await import("@codemirror/lang-cpp")
  const serverPort = await getLSPServer(LanguageMode.CXX, ls)
  const serverUri: any = `ws://127.0.0.1:${serverPort}`

  return () => [
    highlight.cpp(),
    languageServer({
      serverUri,
      rootUri: "file:///inmemory",
      documentUri: "file:///inmemory",
      languageId: "cpp",
      workspaceFolders: null,
    }),
  ]
}

export const pyLsp: LspProvider = async (pyrights: string): Promise<() => Extension> => {
  const highlight = await import("@codemirror/lang-python")
  const serverPort = await getLSPServer(LanguageMode.PY, pyrights)
  const serverUri: any = `ws://127.0.0.1:${serverPort}`
  return () => [
    highlight.python(),
    languageServer({
      serverUri,
      rootUri: "inmemory:///",
      documentUri: "inmemory:///random/file",
      languageId: "python",
      workspaceFolders: null,
    }),
  ]
}
