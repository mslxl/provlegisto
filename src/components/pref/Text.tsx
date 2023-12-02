import { PrimitiveAtom, useAtom } from "jotai"
import { Input } from "../ui/input"
import PrefItem, { PrefItemProps } from "./Item"

type PrefTextProps = {
  atom: PrimitiveAtom<string>
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}
export function PrefText(props: PrefTextProps) {
  const [storage, setStorage] = useAtom(props.atom)
  return (
    <PrefItem {...props}>
      <Input className="text-sm px-2 h-8 my-2" value={storage} onChange={(e) => setStorage(e.target.value)} />
    </PrefItem>
  )
}
