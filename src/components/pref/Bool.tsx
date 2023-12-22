import { PrimitiveAtom, useAtom } from "jotai"
import PrefItem, { PrefItemProps } from "./Item"
import { Checkbox } from "../ui/checkbox"

type PrefBoolProps = {
  atom: PrimitiveAtom<boolean>
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}

export function PrefBool(props: PrefBoolProps) {
  const [storage, setStorage] = useAtom(props.atom)
  return (
    <PrefItem {...props}>
      <Checkbox defaultChecked={storage} onCheckedChange={setStorage as any}/>
    </PrefItem>
  )
}
