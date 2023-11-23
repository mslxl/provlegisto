import { Compartment } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import clsx from "clsx"
import { minimalSetup } from "codemirror"
import { useEffect, useRef } from "react"

type EditorProps = {
  kernel: "codemirror" | "textarea"
  className?: string
  text?: string
  onChange?: (text: string) => void
}
function TextareaEditor(props: EditorProps) {
  return (
    <div className={clsx(props.className, "m-2 border border-slate-400")}>
      <textarea
        value={props.text}
        className="w-full h-full p-1"
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
      ></textarea>
    </div>
  )
}

function CMEditor(props: EditorProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const cm = useRef<EditorView | null>(null)
  const updateCompart = useRef(new Compartment())

  useEffect(() => {
    if (parentRef.current == null) return

    cm.current = new EditorView({
      extensions: [
        minimalSetup,
        updateCompart.current.of(EditorView.updateListener.of(() => {})),
        [
          EditorView.theme({
            "&": {
              outline: "none",
            },
            "&.cm-focused": {
              outline: "none",
            },
          }),
        ],
      ],
      parent: parentRef.current,
    })

    return () => {
      cm.current?.destroy()
    }
  }, [])

  useEffect(() => {
    cm.current?.dispatch({
      effects: updateCompart.current.reconfigure([
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          let code = update.state.doc.toString()
          if (code == props.text) return
          props.onChange && props.onChange(code)
        }),
      ]),
    })
  }, [props.onChange])

  useEffect(() => {
    cm.current?.dispatch({
      changes: [
        {
          from: 0,
          to: cm.current.state.doc.length,
          insert: props.text ?? "",
        },
      ],
    })
  }, [props.text])

  return <div className={clsx(props.className, "border border-slate-400")} ref={parentRef}></div>
}

export default function Editor(props: EditorProps) {
  const stylesheet = "w-full shadow-sm shadow-slate-950"
  if (props.kernel == "codemirror") return <CMEditor className={clsx(props.className, stylesheet)} {...props} />
  else return <TextareaEditor className={clsx(props.className, stylesheet, "w-full")} {...props} />
}
