import { emit, useMitt } from "@/hooks/useMitt"
import useReadAtom from "@/hooks/useReadAtom"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import { createSourceAtom } from "@/store/source"
import { dialog } from "@tauri-apps/api"
import { useAtomValue, useSetAtom } from "jotai"
import { useImmerAtom } from "jotai-immer"

export default function MenuEventReceiver() {
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  const createSource = useSetAtom(createSourceAtom)

  useMitt("fileMenu", async (event) => {
    if (event == "new") {
      //TODO: set default language
      createSource(LanguageMode.CXX)
    } else if (event == "open") {
      //TODO: open source code
      dialog.message('Unimplemented!', {type: 'error', title: 'Error'})
    } else if (event == "save" || event == "saveAs") {
      //TODO: save source code
      dialog.message('Unimplemented!', {type: 'error', title: 'Error'})
    }
    // emit('cache', -1)
  })

  return null
}
