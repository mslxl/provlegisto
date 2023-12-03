import { Atom, PrimitiveAtom, useAtom, useAtomValue } from "jotai"
import PrefItem, { PrefItemProps } from "./Item"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { ReactNode, Suspense } from "react"
import clsx from "clsx"
import { dialog } from "@tauri-apps/api"
import { Skeleton } from "../ui/skeleton"

interface DialogFilter {
  name: string
  extensions: string[]
}
type PrefProgramProps = {
  valueAtom: PrimitiveAtom<string>
  versionAtom: Atom<string | null>
  versionFallback: string
  dialogFilter?: DialogFilter[]
  children?: ReactNode
} & {
  [Property in keyof PrefItemProps as Exclude<Property, "children" | "msg">]: PrefItemProps[Property]
}

function Msg({ atom, fallback }: { atom: Atom<string | null>; fallback: string }) {
  const value = useAtomValue(atom)
  return (
    <span
      className={clsx("text-xs", {
        "text-red-500": value == null,
      })}
    >
      {value ?? fallback}
    </span>
  )
}

export default function PrefProgram(props: PrefProgramProps) {
  const [path, setPath] = useAtom(props.valueAtom)

  async function choosePath() {
    let userChooseFile = await dialog.open({
      multiple: false,
      filters: props.dialogFilter,
    })
    if (userChooseFile == null) return null
    let file = userChooseFile as string
    setPath(file)
  }

  return (
    <div>
      <PrefItem leading={props.leading} className="gap-1">
        <Input
          defaultValue={path}
          onBlur={(e) => setPath(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") setPath((e.target as any).value)
          }}
        />
        <Button variant="outline" onClick={choosePath}>...</Button>
        {props.children}
      </PrefItem>
      <Suspense fallback={<Skeleton className="h-3 w-full my-2"/>}>
        <Msg atom={props.versionAtom} fallback={props.versionFallback} />
      </Suspense>
    </div>
  )
}
