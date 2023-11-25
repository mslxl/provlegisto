import PrimarySide from "./primary-side"
import Tabbar from "./tabbar"
import { useAtom } from "jotai"

import {
  tabHeader,
  activeTabId,
  useAddTabHandle,
  useAtomSourcecodeMap,
  useMoveTabIndexHandle,
  useRemoveSourceCode,
  useSetSourcesCode,
  useSetTabNameHandle,
  useAddTestcaseList,
} from "@/store/tabs"
import Codemirror from "@/components/codemirror"
import clsx from "clsx"
import { useCompetitiveCompanion } from "@/hooks/useCompetitiveCompanion"
import { useMitt } from "@/hooks/useMitt"
import PrimaryPanel from "./primary-panel"
import { primaryPanelShow, statusBarShow } from "@/store/ui"
import Runner from "@/components/runner"
import StatusBar from "@/components/statusbar"

export default function Main() {
  const [data] = useAtom(tabHeader)
  const [active, setActive] = useAtom(activeTabId)
  const [activePrimaryPanel] = useAtom(primaryPanelShow)
  const [showStatusBar] = useAtom(statusBarShow)

  const moveItemSort = useMoveTabIndexHandle()
  const addItem = useAddTabHandle()
  const removeItem = useRemoveSourceCode()
  const updateSourceCode = useSetSourcesCode()
  const sourceCodeMap = useAtomSourcecodeMap()
  const setTabTitleName = useSetTabNameHandle()

  const addProblemTestcaseList = useAddTestcaseList()


  useCompetitiveCompanion((problem) => {
    const id = addItem(problem.name)
    addProblemTestcaseList(id, problem.tests)
  }, [addItem, addProblemTestcaseList])
  useMitt("fileMenu", (event) => {
    if (event == "new") addItem("Unamed")
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
              initialSourceCode={sourceCodeMap.get(head.id) ?? ""}
              onCurrentSourceCodeChange={(content) => updateSourceCode(head.id, content)}
            />
          ))}
        </div>
      </div>
      {showStatusBar ? <StatusBar className="h-6 w-full" /> : null}
    </div>
  )
}
