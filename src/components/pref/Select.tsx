import { useMemo } from "react"
import PrefItem, { PrefItemProps } from "./Item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { PrimitiveAtom, useAtom } from "jotai"
import { map } from "lodash"

type PrefSelectItem = {
  key: string
  value: string
}

type PrefSelectProps = {
  items: PrefSelectItem[]
  atom: PrimitiveAtom<string>
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}

export default function PrefSelect(props: PrefSelectProps) {
  const [value, setValue] = useAtom(props.atom)

  const dict = useMemo(() => 
    new Map(map(props.items, (v) => [v.key, v.value]))
  , [props.items])

  return (
    <PrefItem {...props}>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue className="text-sm px-2 h-8 my-2">{dict.get(value)!}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {props.items.map((v) => (
            <SelectItem value={v.key} key={v.key}>
              {v.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PrefItem>
  )
}
