import { ReactNode } from "react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "../ui/context-menu"
import { useSetAtom } from "jotai"
import { deleteSourceAtom, duplicateSourceAtom } from "@/store/source"

interface SessionContextMenuProps {
  id: string
  children: ReactNode
}
export default function SessionContextMenu(props: SessionContextMenuProps) {
  const removeSource = useSetAtom(deleteSourceAtom)
  const duplicateSource = useSetAtom(duplicateSourceAtom)
  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => removeSource(props.id)}>Close</ContextMenuItem>
        <ContextMenuSeparator/>
        <ContextMenuItem onClick={() => duplicateSource(props.id, (name)=>`${name} - Copy`)}>Duplicate</ContextMenuItem>
        <ContextMenuSeparator/>
        <ContextMenuItem>Reopen with...</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
