import { useMitt } from "@/hooks/useMitt"
import { fromSource, intoSource } from "@/lib/fs/model"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import { activedSourceAtom, createSourceAtom, sourceAtom } from "@/store/source"
import { Source, SourceStore } from "@/store/source/model"
import { dialog } from "@tauri-apps/api"
import {  useAtomValue, useSetAtom } from "jotai"

async function saveFile(source: Source) {
  //TODO: save source code
  //TODO: read default path from local
  //TODO: set default ext and list extensions
  //TODO: save and saveAs are different
  const file = await dialog.save({
    title: "Save as",
    filters: [
      {
        name: "cpp",
        extensions: ["cpp", "c"],
      },
    ],
  })
  if (file) {
    const staticSourceData = fromSource(source)
    await saveProblem(staticSourceData, file)
  }
}

async function openFile(targetStore: SourceStore) {
  let files = await dialog.open({
    title: "Open",
    filters: [
      {
        name: "cpp",
        extensions: ["cpp", "c"],
      },
    ],
    multiple: true,
    directory: false,
  })
  if (files == null) return
  if (typeof files == "string") {
    files = [files]
  }
  //TODO: set local path
  const problems = await openProblem(files)
  targetStore.doc.transact(() => {
    for (let problem of problems) {
      const [source] = targetStore.create()
      intoSource(problem, source)
    }
  })
}

export default function MenuEventReceiver() {
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  const createSource = useSetAtom(createSourceAtom)
  const activedSource = useAtomValue(activedSourceAtom)
  const sourceStore = useAtomValue(sourceAtom)

  useMitt(
    "fileMenu",
    async (event) => {
      if (event == "new") {
        //TODO: set default language
        createSource(LanguageMode.CXX)
      } else if (event == "open") {
        openFile(sourceStore)
      } else if (event == "save" || event == "saveAs") {
        if (activedSource) {
          await saveFile(activedSource)
        } else {
          dialog.message("No file opened!", { type: "error", title: "Save Error" })
        }
      }
      // emit('cache', -1)
    },
    [defaultLanguage, createSource, activedSource, sourceStore],
  )

  return null
}
