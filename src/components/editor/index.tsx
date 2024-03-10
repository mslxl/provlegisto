import useExtensionCompartment, { useCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"
import { editorThemeExtensionAtom } from "@/store/setting/ui"
import { Compartment, Extension } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import clsx from "clsx"
import { minimalSetup } from "codemirror"
import { map } from "lodash"
import { useEffect, useRef } from "react"
import { Text, UndoManager } from "yjs"
// @ts-ignore
import { yCollab } from "y-codemirror.next"

type EditorProps = {
  className?: string
  text: Text | string
}

/**
 * Lite editor based codemirror
 * it will be readonly if the type of text primitive string
 * @param props
 * @returns
 */
export default function Editor(props: EditorProps) {
  const editable = props.text instanceof Text
  const parentRef = useRef<HTMLDivElement>(null)
  const cm = useRef<EditorView | null>(null)
  const collabCompartment = new Compartment()

  const configurableExtensions = useCommonConfigurationExtension(cm)
  // TODO: modify store via collab extension

  useEffect(() => {
    if (parentRef.current == null) return

    cm.current = new EditorView({
      extensions: [
        minimalSetup,
        ...map(configurableExtensions, (e: () => Extension) => e()),
        EditorView.editable.of(editable ?? true),
        collabCompartment.of([]),
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

  useExtensionCompartment(cm, editorThemeExtensionAtom, (v: any) => v())

  useEffect(() => {
    if (typeof props.text == "string") {
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
  useEffect(() => {
    if (props.text instanceof Text) {
      const undoManager = new UndoManager(props.text)
      collabCompartment.reconfigure([yCollab(props.text, null, { undoManager })])
    }
  }, [props.text])

  return (
    <div
      className={clsx("w-full", props.className, "border border-slate-400")}
      ref={parentRef}
    ></div>
  )
}
