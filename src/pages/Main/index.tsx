import { useState } from "react"
import PrimarySide from "./primary-side"
import Tabbar from "./tabbar"
import { useAtom } from "jotai"

import {
  items,
  useAddHandle,
  useAtomSourceCodeMap,
  useMoveItemHandle,
  useRemoveHandle,
  useSetSourcesCodeHandle,
} from "@/store/tabs"
import Codemirror from "@/components/codemirror"
import clsx from "clsx"

export default function Main() {
  const [data] = useAtom(items)
  const [active, setActive] = useState(1)

  const moveItemSort = useMoveItemHandle()
  const addItem = useAddHandle()
  const removeItem = useRemoveHandle()
  const updateSourceCode = useSetSourcesCodeHandle()
  const sourceCodeMap = useAtomSourceCodeMap()

  return (
    <div className="flex-1 flex flex-row">
      <PrimarySide />
      <div className="flex-1 flex flex-col">
        <Tabbar
          className="h-8"
          items={data}
          activeId={active}
          onSelect={setActive}
          swap={moveItemSort}
          onAdd={() => addItem("Unamed")}
          onClose={removeItem}
        />
        {data.map((head) => (
          <Codemirror
            key={head.id}
            className={clsx("box-border h-[calc(100%-2rem)]", {
              hidden: active != head.id,
            })}
            initialSourceCode={sourceCodeMap.get(head.id) ?? ""}
            onCurrentSourceCodeChange={(content) => updateSourceCode(head.id, content)}
          />
        ))}
      </div>
    </div>
  )
}
