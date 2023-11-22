import clsx from "clsx"
import { ReactNode, useEffect, useRef, useState } from "react"
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
import { useRenameDialog } from "./rename-dialog"

type TabItem = {
  id: number
  text: string
}

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

export default function Tabbar({
  className,
  items,
  activeId,
  onSelect,
  onAdd,
  onClose,
  onSetName,
  swap,
}: {
  className: string
  items: TabItem[]
  activeId: number
  onSelect?: (id: number) => void
  onAdd?: () => void
  onClose?: (id: number) => void
  swap?: (from: number, to: number) => void
  onSetName?: (id: number, title: string) => void
}) {
  // handle mousewheel scroll on tab header
  const ulRef = useRef<HTMLUListElement>(null)
  const mouseWheel = useMouseWheel()
  const lastWheel = useRef(0)
  const ulHover = useHoverDirty(ulRef)
  useEffect(() => {
    let delta = mouseWheel - lastWheel.current
    lastWheel.current = mouseWheel
    if (!ulHover) return
    ulRef.current?.scrollBy(delta / 2, 0)
  }, [ulHover, mouseWheel])

  // handle rename dialog
  const [originTabId, setOriginTabId] = useState(0)
  const [RenameDialogPortal, showRenameDialog] = useRenameDialog((title: string) => {
    onSetName && onSetName(originTabId, title)
  })

  return (
    <>
      {RenameDialogPortal}
      <HorizontalUnorderedList className={clsx("text-sm bg-neutral-200 flex items-stretch", className)} ref={ulRef}>
        {items.map((v, index) => (
          <li
            key={index}
            className={clsx(
              {
                "bg-neutral-50": activeId === v.id,
              },
              "px-2",
            )}
          >
            <Bar
              key={index}
              index={index}
              className="h-full"
              closeBtnClassName={clsx({
                invisible: activeId !== v.id,
              })}
              onClick={() => onSelect && onSelect(v.id)}
              onClose={() => onClose && onClose(v.id)}
              swap={swap}
              onSetNameClick={() => {
                setOriginTabId(v.id)
                showRenameDialog(v.text)
              }}
            >
              {v.text}
            </Bar>
          </li>
        ))}
        <li>
          <button className="w-4 h-full mx-2 my-auto" onClick={onAdd}>
            <VscAdd />
          </button>
        </li>
      </HorizontalUnorderedList>
    </>
  )
}

function Bar({
  index,
  children,
  className,
  closeBtnClassName,
  onClick,
  onClose,
  swap,
  onSetNameClick,
}: {
  index: number
  children: string | ReactNode
  className?: string
  closeBtnClassName?: string
  onClick?: () => void
  onClose?: () => void
  swap?: (from: number, to: number) => void
  onSetNameClick?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const [, dragRef] = useDrag({
    type: "tabbox",
    item: { index },
  })
  const [{ hover }, dropRef] = useDrop({
    accept: "tabbox",
    drop: (item: any) => {
      if (swap) swap(item.index, index)
    },
    collect(monitor) {
      return {
        hover: monitor.isOver(),
      }
    },
  })

  dragRef(dropRef(ref))
  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={clsx("flex min-w-min max-w-lg whitespace-nowrap text-ellipsis relative", className, {
          "bg-sky-100": hover,
        })}
        ref={ref}
      >
        <button className="my-auto flex-1 pl-4" onClick={onClick}>
          {children}
        </button>
        <button className={clsx("w-4 h-full ml-2", closeBtnClassName)} onClick={onClose}>
          <VscClose />
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onSetNameClick}>Rename</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onClose}>Close</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Copy Path</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
