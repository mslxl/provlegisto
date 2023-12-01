import { ReactNode } from "react"

type PrefCatalog = {
  children: ReactNode
}
export default function PrefCatalog(props: PrefCatalog) {
  return <ul className="text-lg bg-neutral-100 border-r-2 border-r-neutral-200 py-8 pl-8 pr-16">{props.children}</ul>
}
