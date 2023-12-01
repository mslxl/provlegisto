import PrimarySide from "./sidebar"
import Tabbar from "./tabbar"
import { useAtom, useAtomValue } from "jotai"

import clsx from "clsx"
import PrimaryPanel from "./sidebar-panel"
import { primaryPanelShowAtom, statusBarShowAtom } from "@/store/ui"
import StatusBar from "@/components/statusbar"
import { useZoom } from "@/hooks/useZoom"
import { sourceIndexAtomAtoms } from "@/store/source"
import EditorTabPanel from "./editor-tabpane"
import Runner from "@/components/runner"
import MenuEventReceiver from "./menu-event"

export default function Main() {
  useZoom()

  const [activePrimaryPanel] = useAtom(primaryPanelShowAtom)
  const [showStatusBar] = useAtom(statusBarShowAtom)

  const sourceIndexAtom = useAtomValue(sourceIndexAtomAtoms)


  return (
    <div className="w-full h-full flex flex-col items-stretch">
      <MenuEventReceiver/>
      <div className="flex-1 flex flex-row min-h-0">
        <PrimarySide />
        <PrimaryPanel
          className={clsx({
            hidden: activePrimaryPanel === null,
          })}
        >
        <Runner className={clsx({ hidden: activePrimaryPanel != "run" })} />
        </PrimaryPanel>
        <div className="flex-1 flex flex-col w-0 min-h-0">
          <Tabbar className="h-8" />
          {sourceIndexAtom.map((atom, index) => (
            <EditorTabPanel key={index} className={clsx("box-border flex-1 min-h-0")} headerAtom={atom} />
          ))}
        </div>
      </div>
      {showStatusBar ? <StatusBar className="h-6 w-full" /> : null}
    </div>
  )
}
