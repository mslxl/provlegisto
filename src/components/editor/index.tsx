import useExtensionCompartment, { generateCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"
import { editorThemeExtensionAtom } from "@/store/setting/ui"
import { Compartment, Extension } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import clsx from "clsx"
import { minimalSetup } from "codemirror"
import { map } from "lodash"
import { useEffect, useRef } from "react"

type EditorProps = {
  className?: string
  text?: string
  onChange?: (text: string) => void
  editable?: boolean
}

function CMEditor(props: EditorProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const cm = useRef<EditorView | null>(null)
  const updateCompart = useRef(new Compartment())

  const configurableExtensions = generateCommonConfigurationExtension(cm)

  useEffect(() => {
    if (parentRef.current == null) return

    cm.current = new EditorView({
      extensions: [
        minimalSetup,
        ...map(configurableExtensions, (e: () => Extension) => e()),
        updateCompart.current.of(EditorView.updateListener.of(() => {})),
        EditorView.editable.of(props.editable ?? true),
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
  }, [props.text])

  useExtensionCompartment(cm, editorThemeExtensionAtom, (v: any) => v())

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
    if (cm.current?.state.doc.toString() != props.text) {
      cm.current?.dispatch({
        changes: [
          {
            from: 0,
            to: cm.current.state.doc.length,
            insert: props.text ?? "",
          },
        ],
      })
    }
  }, [props.text])

  return <div className={clsx(props.className, "border border-slate-400")} ref={parentRef}></div>
}

export default function Editor(props: EditorProps) {
  const stylesheet = "w-full shadow-sm shadow-slate-950"
  return <CMEditor className={clsx(props.className, stylesheet)} {...props} />
}
