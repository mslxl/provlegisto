import { useMitt } from "@/hooks/useMitt"
import useReadAtom from "@/hooks/useReadAtom"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { activeIdAtom, counterAtom, emptySource, sourceIndexAtomAtoms, sourceIndexAtoms, sourceStoreAtom, useAddSource } from "@/store/source"
import { useAtom, useSetAtom } from "jotai"
import { useImmerAtom } from "jotai-immer"

export default function MenuEventReceiver() {
  const [counter, incCounter] = useAtom(counterAtom)
  const dispatchSourceIndex = useSetAtom(sourceIndexAtomAtoms)
  const [sourceCodeStore, setSourceCodeStore] = useImmerAtom(sourceStoreAtom)

  const readActiveId = useReadAtom(activeIdAtom)
  const readSourceIndex = useReadAtom(sourceIndexAtoms)
  const addSource = useAddSource()

  useMitt("fileMenu", async (event) => {
    if (event == "new") {
      addSource("Unamed", emptySource())
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
      await saveProblem(source, title, event == "saveAs")
    }
  })

  return null
}
