import PrimarySide from "./primary-side"
import Tabbar from "./tabbar"
import { useAtom, useAtomValue } from "jotai"

import {
  tabHeader,
  activeTabId,
  sourcePath,
  useAddTabHandle,
  useMoveTabIndexHandle,
  useRemoveSourceCode,
  useSetSourcesCode,
  useSetTabNameHandle,
  useAddTestcaseList,
  useAddSourceFromFiles,
  useGetSourcesCode,
  useSaveSourceToFile,
} from "@/store/tabs"
import Codemirror from "@/components/codemirror"
import clsx from "clsx"
import { useCompetitiveCompanion } from "@/hooks/useCompetitiveCompanion"
import { useMitt } from "@/hooks/useMitt"
import PrimaryPanel from "./primary-panel"
import { primaryPanelShow, statusBarShow } from "@/store/ui"
import Runner from "@/components/runner"
import StatusBar from "@/components/statusbar"
import { dialog } from "@tauri-apps/api"

export default function Main() {
  const data = useAtomValue(tabHeader)
  const [active, setActive] = useAtom(activeTabId)
  const [activePrimaryPanel] = useAtom(primaryPanelShow)
  const [showStatusBar] = useAtom(statusBarShow)
  const [sourcePathMap, setSourcePathMap] = useAtom(sourcePath)

  const moveItemSort = useMoveTabIndexHandle()
  const addItem = useAddTabHandle()
  const removeItem = useRemoveSourceCode()
  const updateSourceCode = useSetSourcesCode()
  const getSourceCode = useGetSourcesCode()
  const setTabTitleName = useSetTabNameHandle()

  const addProblemTestcaseList = useAddTestcaseList()

  useCompetitiveCompanion(
    (problem) => {
      const id = addItem(problem.name)
      addProblemTestcaseList(id, problem.tests)
    },
    [addItem, addProblemTestcaseList],
  )
  const addFiles = useAddSourceFromFiles()
  const saveFile = useSaveSourceToFile()

  useMitt("fileMenu", async (event) => {
    if (event == "new") addItem("Unamed")
    else if (event == "open") {
      const files = await dialog.open({
        filters: [
          {
            name: "c++/c source file",
            extensions: ["cpp", "c"],
          },
        ],
      })
      // parse header
      if (files == null) return
      const sources = typeof files == "string" ? [files] : files
      await addFiles(sources)
    } else if (event == "save") {
      let targetFile = sourcePathMap.get(active)
      if (targetFile === undefined) {
        const path = await dialog.save({
          defaultPath: `${data.find((v) => v.id == active)!.text}.cpp`,
          filters: [
            {
              name: "c++/c source file",
              extensions: ["cpp", "c"],
            },
          ],
        })
        if (path == null) return
        setSourcePathMap(new Map([...sourcePathMap, [active, path]]))
        targetFile = path
      }
      await saveFile(targetFile, active)
    }
  })

  return (
    <div className="w-full h-full flex flex-col items-stretch">
      <div className="flex-1 flex flex-row min-h-0">
        <PrimarySide />
        <PrimaryPanel
          className={clsx({
            hidden: activePrimaryPanel === null,
          })}
        >
          <Runner id={active} className={clsx({ hidden: activePrimaryPanel != "run" })} />
        </PrimaryPanel>
        <div className="flex-1 flex flex-col w-0 min-h-0">
          <Tabbar
            className="h-8"
            items={data}
            activeId={active}
            onSelect={setActive}
            swap={moveItemSort}
            onAdd={() => addItem("Unamed")}
            onClose={removeItem}
            onSetName={setTabTitleName}
          />
          {data.map((head) => (
            <Codemirror
              key={head.id}
              className={clsx("box-border flex-1 min-h-0", {
                hidden: active != head.id,
              })}
              initialSourceCode={getSourceCode(head.id) ?? ""}
              onCurrentSourceCodeChange={(content) => updateSourceCode(head.id, content)}
            />
          ))}
        </div>
      </div>
      {showStatusBar ? <StatusBar className="h-6 w-full" /> : null}
    </div>
  )
}
