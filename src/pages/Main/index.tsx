import PrimarySide from "./sidebar"
import Tabbar from "./tabbar"
import { useAtom, useAtomValue } from "jotai"

import clsx from "clsx"
import PrimaryPanel from "./sidebar-panel"
import { primaryPanelShowAtom, statusBarShowAtom } from "@/store/ui"
import StatusBar from "@/components/statusbar"
import { useZoom } from "@/hooks/useZoom"
import { sourceIndexAtomAtoms, sourceIndexAtoms } from "@/store/source"
import EditorTabPanel from "./editor-tabpane"
import Runner from "@/components/runner"
import MenuEventReceiver from "./menu-event"
import { hostnameAtom, setupDeviceAtom } from "@/store/setting/setup"
import { useNavigate } from "react-router-dom"
import * as log from "tauri-plugin-log-api"
import { useEffect } from "react"
import { zip } from "lodash"
import { motion } from "framer-motion"

export default function Main() {
  useZoom()
  const hostname = useAtomValue(hostnameAtom)
  const setupHostname = useAtomValue(setupDeviceAtom)
  const navgiate = useNavigate()
  const [activePrimaryPanel] = useAtom(primaryPanelShowAtom)
  const [showStatusBar] = useAtom(statusBarShowAtom)

  const sourceIndexContent = useAtomValue(sourceIndexAtoms)
  const sourceIndexAtom = useAtomValue(sourceIndexAtomAtoms)
  const sourceIndex = zip(sourceIndexContent, sourceIndexAtom)

  useEffect(() => {
    log.info(`hostname: ${hostname}`)
    log.info(`setupHostname: ${setupHostname}`)
    if (setupHostname != hostname) navgiate("/setup")
  }, [hostname, setupHostname])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-stretch">
      <MenuEventReceiver />
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
          {sourceIndex.map(([content, atom]) => (
            <EditorTabPanel key={content!.id} className={clsx("box-border flex-1 min-h-0")} headerAtom={atom!} />
          ))}
        </div>
      </div>
      {showStatusBar ? <StatusBar className="h-6 w-full" /> : null}
    </motion.div>
  )
}
