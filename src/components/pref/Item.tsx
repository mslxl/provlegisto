import clsx from "clsx"
import { ReactNode } from "react"

export type PrefItemProps = {
  leading: string
  description?: string
  msg?: string | null
  className?: string
  children: ReactNode
}

export default function PrefItem(props: PrefItemProps) {
  return (
    <div>
      <div className="my-2">
        <h3 className="text-lg">{props.leading}</h3>
        <p className="text-xs">{props.description}</p>
      </div>
      <div className={clsx("flex gap-0 content-stretch", props.className)}>{props.children}</div>
      {props.msg ? <span className="text-red-600 text-xs">{props.msg}</span> : null}
    </div>
  )
}
