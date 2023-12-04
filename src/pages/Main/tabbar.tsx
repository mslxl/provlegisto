import clsx from "clsx"
import { useEffect, useMemo, useRef } from "react"
import { VscAdd, VscClose } from "react-icons/vsc"
import { useDrag, useDrop } from "react-dnd"
import { useHoverDirty, useMouseWheel } from "react-use"
import { styled } from "styled-components"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useRenameDialog } from "../../hooks/useRenameDialog"
import {
  SourceHeader,
  activeIdAtom,
  emptySource,
  sourceIndexAtomAtoms,
  sourceStoreAtom,
  useAddSource,
} from "@/store/source"
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai"
import { focusAtom } from "jotai-optics"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import useChangeLanguageDialog from "@/hooks/useChangeLanguageDialog"
import { defaultLanguageAtom } from "@/store/setting/setup"

const HorizontalUnorderedList = styled.ul`
  position: relative;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 2px;
    background-color: transparent;
  }
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgb(115 115 115 / var(--tw-bg-opacity));
  }
  &::-webkit-scrollbar-thumb {
    transition: background-color 0.5s ease;
    background-color: transparent;
  }
`

export default function Tabbar({ className }: { className: string }) {
  // handle mousewheel scroll on tab header
  const ulRef = useRef<HTMLUListElement>(null)
  const mouseWheel = useMouseWheel()
  const lastWheel = useRef(0)
  const ulHover = useHoverDirty(ulRef)
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  useEffect(() => {
    let delta = mouseWheel - lastWheel.current
    lastWheel.current = mouseWheel
    if (!ulHover) return
    ulRef.current?.scrollBy(delta / 2, 0)
  }, [ulHover, mouseWheel])

  const [sourceIndexAtoms, patchSourceIndexAtoms] = useAtom(sourceIndexAtomAtoms)
  const addSource = useAddSource()

  return (
    <>
      <HorizontalUnorderedList className={clsx("text-sm bg-neutral-200 flex items-stretch", className)} ref={ulRef}>
        {sourceIndexAtoms.map((atom, index) => (
          <li key={index}>
            <Bar
              key={index}
              className="h-full"
              atom={atom}
              removeAtom={() => patchSourceIndexAtoms({ type: "remove", atom })}
              moveAtom={(from, to) => patchSourceIndexAtoms({ type: "move", atom: from, before: to })}
            />
          </li>
        ))}
        <li>
          <button className="w-4 h-full mx-2 my-auto" onClick={() => addSource("Unamed", emptySource(defaultLanguage!))}>
            <VscAdd />
          </button>
        </li>
      </HorizontalUnorderedList>
    </>
  )
}

function Bar({
  className,
  atom,
  moveAtom,
  removeAtom,
}: {
  className?: string
  atom: PrimitiveAtom<SourceHeader>
  moveAtom: (fromAtom: PrimitiveAtom<SourceHeader>, toId: PrimitiveAtom<SourceHeader>) => void
  removeAtom: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [content, setContent] = useAtom(atom)
  const [activeId, setActiveId] = useAtom(activeIdAtom)
  const currentLanguageAtom = useMemo(
    () => focusAtom(sourceStoreAtom, (optic) => optic.prop(content.id).prop("code").prop("language")),
    [atom, content],
  )
  const [, dragRef] = useDrag({
    type: "tabbox",
    item: { atom },
  })
  const [{ hover }, dropRef] = useDrop({
    accept: "tabbox",
    drop: (item: any) => {
      moveAtom(item.atom, atom)
    },
    collect(monitor) {
      return {
        hover: monitor.isOver(),
      }
    },
  })

  const [renameDialog, showRenameDialog] = useRenameDialog((value) => {
    setContent((e) => ({
      ...e,
      title: value,
    }))
  })
  const [changeLanguageDialog, showChangeLanguageDialog] = useChangeLanguageDialog(currentLanguageAtom as any)

  dragRef(dropRef(ref))
  return (
    <ContextMenu>
      {renameDialog}
      {changeLanguageDialog}

      <AlertDialog>
        <AlertDialogTrigger asChild></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Language</AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      <ContextMenuTrigger
        className={clsx("flex min-w-min max-w-lg whitespace-nowrap text-ellipsis relative px-2", className, {
          "bg-sky-100": hover,
          "bg-neutral-50": content.id == activeId,
        })}
        ref={ref}
      >
        <button className="my-auto flex-1 pl-4" onClick={() => setActiveId(content.id)}>
          {content.title}
        </button>
        <button
          className={clsx("w-4 h-full ml-2", {
            invisible: content.id != activeId,
          })}
          onClick={removeAtom}
        >
          <VscClose />
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => showRenameDialog(content.title)}>Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={removeAtom}>Close</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy Path</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => showChangeLanguageDialog()}>Change Language</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
