import { emit, useMitt } from "@/hooks/useMitt"
import useReadAtom from "@/hooks/useReadAtom"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import { activeIdAtom, emptySource, sourceIndexAtoms, sourceStoreAtom, useAddSources } from "@/store/source"
import { dialog } from "@tauri-apps/api"
import { useAtomValue } from "jotai"
import { useImmerAtom } from "jotai-immer"
import { crc16 } from "crc"

export default function MenuEventReceiver() {
  const [sourceCodeStore, setSourceCodeStore] = useImmerAtom(sourceStoreAtom)

  const readActiveId = useReadAtom(activeIdAtom)
  const readSourceIndex = useReadAtom(sourceIndexAtoms)
  const addSources = useAddSources()
  const defaultLanguage = useAtomValue(defaultLanguageAtom)

  useMitt("fileMenu", async (event) => {
    if (event == "new") {
      addSources([
        {
          title: "Unamed",
          source: emptySource(defaultLanguage!),
        },
      ])
    } else if (event == "open") {
      const problems = (await openProblem()).map(([title, source]) => ({ title, source }))
      addSources(problems)
    } else if (event == "save" || event == "saveAs") {
      const id = readActiveId()
      console.log(id)
      if (id < 0) return
      const title = readSourceIndex().find((h) => h.id == id)!.title
      const source = sourceCodeStore[id]

      const choosePathWhenAlreadySaved = event == "saveAs"

      const extension = (() => {
        if (source.code.language == LanguageMode.CXX) return "cpp"
        else if (source.code.language == LanguageMode.PY) return "py"
        return "txt"
      })()

      const filepath = await (async () => {
        if (source.path != undefined && !choosePathWhenAlreadySaved) {
          return source.path!
        } else {
          return await dialog.save({
            filters: [
              {
                name: "Source File",
                extensions: [extension],
              },
            ],
          })
        }
      })()
      if (filepath == null) return
      setSourceCodeStore((prev) => {
        prev[id].path = filepath
        prev[id].code.savedCrc = crc16(prev[id].code.source)
      })
      await saveProblem(source, title, filepath)

    }
    emit('cache', -1)
  })

  return null
}
