import { languageServer } from "codemirror-languageserver"
import { Extension } from "@codemirror/state"
import { LanguageMode, getLSPServer } from "@/lib/ipc"
export async function loadCXXMode(): Promise<Extension> {
  const highlight = await import("@codemirror/lang-cpp")
  const serverPort = await getLSPServer(LanguageMode.CXX)
  const serverUri: any = `ws://127.0.0.1:${serverPort}`

  return [
    highlight.cpp(),
    languageServer({
      serverUri,
      rootUri: "inmemory:///",
      documentUri: "inmemory:///random/file",
      languageId: "cpp",
      workspaceFolders: null,
    }),
  ]
}

export async function loadPYMode(): Promise<Extension> {
  const highlight = await import("@codemirror/lang-python")
  const serverPort = await getLSPServer(LanguageMode.PY)
  const serverUri: any = `ws://127.0.0.1:${serverPort}`

  return [
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
