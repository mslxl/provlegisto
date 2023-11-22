import { EditorView } from "@codemirror/view"
import { minimalSetup } from "codemirror"
import { useEffect, useRef } from "react"

type EditorProps = {
  kernel: "codemirror" | "textarea"
  className?: string
}

function CMEditor(props: EditorProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (parentRef.current == null) return

    let codemirror = new EditorView({
      extensions: [minimalSetup],
      parent: parentRef.current,
    })

    return () => {
      codemirror.destroy()
    }
  })

  return <div className={props.className} ref={parentRef}></div>
}

export default function Editor(props: EditorProps) {
  return CMEditor(props)
}
