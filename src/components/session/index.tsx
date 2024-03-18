import { activedSourceIdAtom, deleteSourceAtom, sourceAtom, sourceIdsAtom } from "@/store/source"
import clsx from "clsx"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { isEmpty } from "lodash/fp"
import { VscClose, VscFile } from "react-icons/vsc"
import SessionContextMenu from "./SessionContextMenu"
import useChangeLanguageDialog from "@/hooks/useChangeLanguageDialog"

import * as log from 'tauri-plugin-log-api'

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
      <span className="flex-1">{nameDisplay}</span>
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

  const [dialogChangeLanguage, showChangeLanguageDialog] = useChangeLanguageDialog()


  async function changeLanguage(id: string){
    const src = sourceStore.get(id)
    if(!src) return
    const newLanguage = await showChangeLanguageDialog(src.language)
    if(newLanguage){
      log.info(`change lang of ${id} to ${newLanguage}`)
      src.language = newLanguage
    }
  }

  const filesList = sourceIds.map((v) => (
    <li key={v}>
      <SessionContextMenu id={v} onChangeLanguage={changeLanguage}>
        <FileItem id={v} onClick={setActivedSourceId} actived={activedSourceId == v} onRemove={removeSource} />
      </SessionContextMenu>
    </li>
  ))

  return (
    <>
      {dialogChangeLanguage}
      <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")}>
        <ul className="overflow-auto divide-transparent">{filesList}</ul>
      </div>
    </>
  )
}
