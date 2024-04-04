import { activedSourceIdAtom, createSourceAtom, deleteSourceAtom, sourceAtom, sourceIdsAtom } from "@/store/source"
import clsx from "clsx"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { isEmpty } from "lodash/fp"
import { VscClose, VscFile, VscNewFile } from "react-icons/vsc"
import SessionContextMenu from "./SessionContextMenu"
import useChangeLanguageDialog from "./useChangeLanguageDialog"

import * as log from "tauri-plugin-log-api"
import { defaultLanguageAtom, defaultMemoryLimitsAtom, defaultTimeLimitsAtom } from "@/store/setting/setup"
import { useHoverDirty } from "react-use"
import { useRef } from "react"
import { useRenameDialog } from "./useRenameDialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface FileItemProps {
  id: string
  actived: boolean
  onClick: (id: string) => void
  onRemove: (id: string) => void
}
function FileItem(props: FileItemProps) {
  const store = useAtomValue(sourceAtom)
  const src = store.get(props.id)
  const name = src!.useName()
  const nameDisplay = isEmpty(name) ? "Unamed" : name

  return (
    <div
      className={clsx("text-sm px-2 py-1 truncate hover:bg-neutral-200 flex items-center", {
        "bg-neutral-200": props.actived,
      })}
      onClick={() => props.onClick(props.id)}
    >
            <VscFile className="mx-1" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-1 truncate">{nameDisplay}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{nameDisplay}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <button onClick={() => props.onRemove(props.id)}>
        <VscClose></VscClose>
      </button>
    </div>
  )
}

interface SessionPanelProps {
  className?: string
}
export default function SessionPanel(props: SessionPanelProps) {
  const sourceIds = useAtomValue(sourceIdsAtom)
  const [activedSourceId, setActivedSourceId] = useAtom(activedSourceIdAtom)
  const removeSource = useSetAtom(deleteSourceAtom)
  const sourceStore = useAtomValue(sourceAtom)
  const createSource = useSetAtom(createSourceAtom)
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  const defaultTimeLimit = useAtomValue(defaultTimeLimitsAtom)
  const defaultMemoryLimit = useAtomValue(defaultMemoryLimitsAtom)

  const [dialogChangeLanguageElem, showChangeLanguageDialog] = useChangeLanguageDialog()
  const [renameElem, showRenameDialog] = useRenameDialog()

  const sessionPanelRef = useRef<HTMLDivElement>(null)
  const isHover = useHoverDirty(sessionPanelRef)

  async function changeLanguage(id: string) {
    const src = sourceStore.get(id)
    if (!src) return
    const newLanguage = await showChangeLanguageDialog(src.language)
    if (newLanguage) {
      log.info(`change lang of ${id} to ${newLanguage}`)
      src.language = newLanguage
    }
  }
  async function renameSource(id: string) {
    const src = sourceStore.get(id)
    if (!src) return
    const newName = await showRenameDialog(src.name.toString())
    if (newName) {
      log.info(`rename ${id} to ${newName}`)
      src.name.delete(0, src.name.length)
      src.name.insert(0, newName)
    }
  }

  const filesList = sourceIds.map((v) => (
    <li key={v}>
      <SessionContextMenu id={v} onChangeLanguage={changeLanguage} onRename={renameSource}>
        <FileItem id={v} onClick={setActivedSourceId} actived={activedSourceId == v} onRemove={removeSource} />
      </SessionContextMenu>
    </li>
  ))

  function newFile() {
    createSource(defaultLanguage, defaultTimeLimit, defaultMemoryLimit)
  }

  return (
    <>
      {dialogChangeLanguageElem}
      {renameElem}
      <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")} ref={sessionPanelRef}>
        <ul className="overflow-auto divide-transparent">
          <li className="sticky top-0 bg-accent">
            <div className="shadow-sm flex pl-2">
              <span className="truncate font-semibold">FILES</span>
              <span className="flex-1"></span>
              <button className={clsx("p-1 hover:bg-neutral-200", { hidden: !isHover })} onClick={newFile}>
                <VscNewFile />
              </button>
            </div>
          </li>
          {filesList}
        </ul>
      </div>
    </>
  )
}
