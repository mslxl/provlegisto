import { useMitt } from "@/hooks/useMitt"
import { fromSource } from "@/lib/fs/model"
import { openProblem, saveProblem } from "@/lib/fs/problem"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import { activedSourceAtom, createSourceAtom, sourceAtom } from "@/store/source"
import { Source, SourceStore } from "@/store/source/model"
import { dialog } from "@tauri-apps/api"
import { useAtomValue, useSetAtom } from "jotai"
import { LocalSourceMetadata, getSourceMetaAtom, setSourceMetaAtom } from "@/store/source/local"
import { crc16 } from "crc"
import { zip } from "lodash/fp"

/**
 * Save source to file
 * It will open a dialog to select target file if target is not specify
 * @param source
 * @param target
 */
async function saveFile(source: Source, getSaveTarget?: (id: string) => string | undefined) {
  //TODO: set default ext and list extensions

  let file = null
  if (getSaveTarget) {
    file = getSaveTarget(source.id)
  }

  // no metadata found, let user choose file
  if (!file) {
    file = await dialog.save({
      title: "Save as",
      filters: [
        {
          name: "cpp",
          extensions: ["cpp", "c"],
        },
      ],
    })
  }

  // if it is null, that's means user cancel operation
  if (file) {
    const staticSourceData = fromSource(source)
    await saveProblem(staticSourceData, file)
  }
}

async function openFile(targetStore: SourceStore, setMetadata?: (id: string, data: LocalSourceMetadata) => void) {
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
  const problems = await openProblem(files)
  targetStore.doc.transact(() => {
    files = files as string[]
    for (let [filepath, problem] of zip(files, problems)) {
      const [source] = targetStore.createFromStatic(problem!)
      if(setMetadata){
        setMetadata(source.id, {
          crc16: crc16(source.source.toString()),
          pathname: filepath!
        })
      }
    }
  })
}

export default function MenuEventReceiver() {
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  const createSource = useSetAtom(createSourceAtom)
  const activedSource = useAtomValue(activedSourceAtom)
  const sourceStore = useAtomValue(sourceAtom)
  const getSourceMeta = useSetAtom(getSourceMetaAtom)
  const setSourceMeta = useSetAtom(setSourceMetaAtom)

  useMitt(
    "fileMenu",
    async (event) => {
      if (event == "new") {
        //TODO: set default language
        createSource(LanguageMode.CXX)
      } else if (event == "open") {
        openFile(sourceStore, setSourceMeta)
      } else if (event == "save" || event == "saveAs") {
        if (activedSource) {
          if (event == "saveAs") {
            await saveFile(activedSource)
          } else {
            await saveFile(activedSource, (id) => getSourceMeta(id)?.pathname)
          }
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
