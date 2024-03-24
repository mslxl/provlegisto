import { Input } from "../ui/input"
import PrefItem, { PrefItemProps } from "./Item"

type PrefTextProps = {
  value: string,
  onChange: (value: string)=>void
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}
export function PrefText(props: PrefTextProps) {
  return (
    <PrefItem {...props}>
      <Input className="text-sm px-2 h-8 my-2" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </PrefItem>
  )
}
