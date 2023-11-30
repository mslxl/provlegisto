import { WritableAtom, useAtom } from "jotai"
import { Input } from "../ui/input"
import * as z from "zod"
import { FaAngleUp, FaAngleDown } from "react-icons/fa6"
import { useEffect, useState } from "react"
import { ZodError } from "zod"
import PrefItem, { PrefItemProps } from "./Item"

type PrefNumberProps = {
  atom: WritableAtom<number, any[], unknown>
  max?: number
  min?: number
  step?: number
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}
export function PrefNumber(props: PrefNumberProps) {
  const [storage, setStorage] = useAtom(props.atom)
  const [value, setValue] = useState(storage.toString())
  useEffect(() => {
    setValue(storage.toString())
  }, [storage])
  const [msg, setMsg] = useState<string | null>(null)
  function updateValue(e: string) {
    setMsg(null)
    setValue(e)
    let p = z.coerce.number({
      required_error: "It can not be empty",
      invalid_type_error: "It must be a number",
    })
    if (props.max)
      p = p.max(props.max, {
        message: `It must >= ${props.max}`,
      })
    if (props.min)
      p = p.min(props.min, {
        message: `It must <= ${props.min}`,
      })
    try {
      const v = p.parse(e)
      setStorage(v)
    } catch (e: any) {
      if (e instanceof ZodError) {
        setMsg(e.issues.map((z) => z.message).join("\n"))
      }
    }
  }
  function applyOffset(offset: number) {
    if (
      props.max !== undefined &&
      storage + offset <= props.max &&
      props.min != undefined &&
      storage + offset >= props.min
    ) {
      const target = Math.round((storage + offset) * 100) / 100
      setStorage(target)
    }
  }
  return (
    <PrefItem msg={msg} {...props}>
      <Input className="text-sm px-2 h-8 my-2" value={value} onChange={(e) => updateValue(e.target.value)} />
      {props.step === undefined ? null : (
        <div className="flex flex-col items-stretch py-2">
          <button className="flex-1" onClick={() => applyOffset(props.step!)}>
            <FaAngleUp />
          </button>
          <button className="flex-1" onClick={() => applyOffset(-props.step!)}>
            <FaAngleDown />
          </button>
        </div>
      )}
    </PrefItem>
  )
}
