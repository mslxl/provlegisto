import { ReactNode } from "react"

type PrefCatalog = {
  children: ReactNode
}
export default function PrefCatalog(props: PrefCatalog) {
  return <ul className="text-lg bg-slate-100 py-8 pl-8 pr-16">{props.children}</ul>
}
