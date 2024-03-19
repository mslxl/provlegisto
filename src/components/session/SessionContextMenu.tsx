import { ReactNode } from "react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu"
import { useSetAtom } from "jotai"
import { deleteSourceAtom, duplicateSourceAtom } from "@/store/source"

interface SessionContextMenuProps {
  id: string
  children: ReactNode
  onRename: (id: string) => void
  onChangeLanguage: (id: string) => void
}
export default function SessionContextMenu(props: SessionContextMenuProps) {
  const removeSource = useSetAtom(deleteSourceAtom)
  const duplicateSource = useSetAtom(duplicateSourceAtom)

  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => removeSource(props.id)}>Close</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => duplicateSource(props.id, (name) => `${name} - Copy`)}>
          Duplicate
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => props.onRename(props.id)}>Rename</ContextMenuItem>
        <ContextMenuItem onClick={() => props.onChangeLanguage(props.id)}>Change Language</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Reopen with...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
