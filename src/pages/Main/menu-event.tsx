import { useMitt } from "@/hooks/useMitt"
import useReadAtom from "@/hooks/useReadAtom"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import {
  activeIdAtom,
  counterAtom,
  emptySource,
  sourceIndexAtomAtoms,
  sourceIndexAtoms,
  sourceStoreAtom,
  useAddSource,
} from "@/store/source"
import { dialog } from "@tauri-apps/api"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useImmerAtom } from "jotai-immer"

export default function MenuEventReceiver() {
  const [counter, incCounter] = useAtom(counterAtom)
  const dispatchSourceIndex = useSetAtom(sourceIndexAtomAtoms)
  const [sourceCodeStore, setSourceCodeStore] = useImmerAtom(sourceStoreAtom)

  const readActiveId = useReadAtom(activeIdAtom)
  const readSourceIndex = useReadAtom(sourceIndexAtoms)
  const addSource = useAddSource()
  const defaultLanguage = useAtomValue(defaultLanguageAtom)

  useMitt("fileMenu", async (event) => {
    if (event == "new") {
      addSource("Unamed", emptySource(defaultLanguage!))
    } else if (event == "open") {
      const problems = await openProblem()
      for (let i = 0; i < problems.length; i++) {
        setSourceCodeStore((store) => {
          store[counter + i] = problems[i][1]
        })
        dispatchSourceIndex({
          type: "insert",
          value: {
            id: counter + i,
            title: problems[i][0],
          },
        })
      }
      incCounter(problems.length)
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
      })
      await saveProblem(source, title, filepath)
    }
  })

  return null
}
