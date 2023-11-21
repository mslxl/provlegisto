import clsx from "clsx"
import { ReactNode, useRef } from "react"
import { VscAdd, VscClose } from "react-icons/vsc"
import { useDrag, useDrop } from "react-dnd"

type TabItem = {
  id: number
  text: string
}

export default function Tabbar({
  className,
  items,
  activeId,
  onSelect,
  onAdd,
  onClose,
  swap,
}: {
  className: string
  items: TabItem[]
  activeId: number
  onSelect?: (id: number) => void
  onAdd?: () => void
  onClose?: (id: number) => void
  swap?: (from: number, to: number) => void
}) {
  return (
    <div className={clsx(" text-sm bg-neutral-200 flex items-stretch", className)}>
      {items.map((v, index) => (
        <Bar
          key={index}
          index={index}
          className={clsx({
            "bg-neutral-100": activeId === v.id,
          })}
          closeBtnClassName={clsx({
            hidden: activeId !== v.id,
          })}
          onClick={() => onSelect && onSelect(v.id)}
          onClose={() => onClose && onClose(v.id)}
          swap={swap}
        >
          {v.text}
        </Bar>
      ))}
      <button className="w-4 h-full mx-2 my-auto" onClick={onAdd}>
        <VscAdd />
      </button>
    </div>
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
}: {
  index: number
  children: string | ReactNode
  className?: string
  closeBtnClassName?: string
  onClick?: () => void
  onClose?: () => void
  swap?: (from: number, to: number) => void
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
    <div className={clsx("flex w-28 relative", className, { "bg-sky-100": hover })} ref={ref}>
      <button className="my-auto flex-1" onClick={onClick}>
        {children}
      </button>
      <button
        className={clsx("absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4", closeBtnClassName)}
        onClick={onClose}
      >
        <VscClose />
      </button>
    </div>
  )
}
