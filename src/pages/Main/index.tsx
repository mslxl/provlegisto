import PrimarySide from "./sidebar"
import clsx from "clsx"
import PrimaryPanel from "./sidebar-panel"
import StatusBar from "@/components/statusbar"
import EditorTabPanel from "./editor"
import RunnerPanel from "@/components/runner"
import MainEventRegister from "./event"
import { useAtom, useAtomValue } from "jotai"
import { primaryPanelShowAtom, statusBarShowAtom } from "@/store/ui"
import { useZoom } from "@/lib/hooks/useZoom"
import { motion } from "framer-motion"
import { activedSourceAtom } from "@/store/source"
import SessionPanel from "@/components/session"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { isCurrentDeviceSetupAtom } from "@/store/setting/setup"
import CollabPanel from "@/components/collab"

export default function Main() {
  useZoom()
  const navgiate = useNavigate()
  const [activePrimaryPanel] = useAtom(primaryPanelShowAtom)
  const [showStatusBar] = useAtom(statusBarShowAtom)

  const isSetup = useAtomValue(isCurrentDeviceSetupAtom)
  useEffect(() => {
    if (!isSetup) {
      navgiate("/setup")
    }
  }, [isSetup])
  const activedSource = useAtomValue(activedSourceAtom)

  const editor = activedSource ? (
    <EditorTabPanel className="box-border flex-1 min-h-0" source={activedSource} />
  ) : (
    //TODO: make it beautiful
    <div className="box-border flex-1 min-h-0">No File opened</div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-stretch">
      <MainEventRegister />
      <div className="flex-1 flex flex-row min-h-0">
        <PrimarySide />
        <PrimaryPanel
          className={clsx({
            hidden: activePrimaryPanel === null,
          })}
        >
          <RunnerPanel className={clsx({ hidden: activePrimaryPanel != "run" })} source={activedSource} />
          <SessionPanel className={clsx({ hidden: activePrimaryPanel != "files" })} />
          <CollabPanel className={clsx({ hidden: activePrimaryPanel != "collab" })} />
        </PrimaryPanel>
        <div className="flex-1 flex flex-col w-0 min-h-0">{editor}</div>
      </div>
      {showStatusBar ? <StatusBar className="h-6 w-full" /> : null}
    </motion.div>
  )
}
