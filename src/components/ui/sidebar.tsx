import clsx from "clsx"
import { ReactNode } from "react"

export function Button({
  children,
  className,
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      className={clsx(className, "text-neutral-400 hover:text-neutral-100 mx-auto text-center")}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function Space({ className }: { className?: string }) {
  return <span className={clsx("flex-1", className)} />
}

export function Root({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("bg-zinc-800 flex flex-col w-12", className)}>{children}</div>
}
