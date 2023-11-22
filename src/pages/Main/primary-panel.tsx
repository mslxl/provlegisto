import clsx from "clsx"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useWindowSize } from "react-use"

export default function PrimaryPanel({ children, className }: { children?: ReactNode; className?: string }) {
  const [width, setWidth] = useState(240)
  const colResizeRef = useRef<HTMLSpanElement>(null)
  const windowWidth = useWindowSize().width

  useEffect(() => {
    if (colResizeRef.current == null) return
    let startX = 0
    let startWidth = 0
    function onDrag(e: MouseEvent) {
      let newWidth = startWidth + (e.clientX - startX)
      if (newWidth > 80 && newWidth < windowWidth * 0.8) setWidth(newWidth)
    }
    function stopDrag() {
      document.documentElement.removeEventListener("mousemove", onDrag)
      document.documentElement.removeEventListener("mouseup", stopDrag)
    }
    function startDrag(e: MouseEvent) {
      startX = e.clientX
      startWidth = width
      document.documentElement.addEventListener("mousemove", onDrag)
      document.documentElement.addEventListener("mouseup", stopDrag)
    }
    colResizeRef.current.addEventListener("mousedown", startDrag)
    return () => {
      colResizeRef.current?.removeEventListener("mousedown", startDrag)
    }
  }, [colResizeRef, width])

  return (
    <div
      className={clsx("bg-neutral-100 border-r-2 border-r-neutral-200 h-full flex shadow-md", className)}
      style={{ width: `${width}px` }}
    >
      <div className="flex-1 relative">{children}</div>
      <span className="w-1 cursor-col-resize" ref={colResizeRef} />
    </div>
  )
}
