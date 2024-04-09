import useExtensionCompartment, { useCommonConfigurationExtension } from "@/lib/hooks/useExtensionCompartment"
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

const cmStyleNoOutline = [
  EditorView.theme({
    "&": {
      outline: "none",
    },
    "&.cm-focused": {
      outline: "none",
    },
  }),
]

/**
 * Lite editor based codemirror
 * it will be readonly if the type of text primitive string
 * @param props
 * @returns
 */
export default function Editor(props: EditorProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const cm = useRef<EditorView | null>(null)

  // ycollab compartment, used to modify and share text if its type is Text(not primitive)
  const collabCompartment = new Compartment()
  const editorCompartment = new Compartment()

  const configurableExtensions = useCommonConfigurationExtension(cm)
  useEffect(() => {
    if (parentRef.current == null) return

    cm.current = new EditorView({
      extensions: [
        minimalSetup,
        ...map(configurableExtensions, (e: () => Extension) => e()),
        editorCompartment.of(EditorView.editable.of(false)),
        collabCompartment.of([]),
        cmStyleNoOutline,
      ],
      doc: props.text.toString(),
      parent: parentRef.current,
    })

    return () => {
      cm.current?.destroy()
    }
  }, [])

  useExtensionCompartment(cm, editorThemeExtensionAtom, (v: any) => v())

  // update text if its type
  useEffect(() => {
    if (typeof props.text == "string") {
      cm.current?.dispatch({
        effects: [editorCompartment.reconfigure(EditorView.editable.of(false)), collabCompartment.reconfigure([])],
      })
      cm.current?.dispatch({
        changes: [
          {
            from: 0,
            to: cm.current.state.doc.length,
            insert: props.text ?? "",
          },
        ],
      })
    } else if (props.text instanceof Text) {
      const undoManager = new UndoManager(props.text)
      cm.current?.dispatch({
        effects: [
          editorCompartment.reconfigure(EditorView.editable.of(true)),
          collabCompartment.reconfigure([yCollab(props.text, null, { undoManager })]),
        ],
      })
    }
  }, [props.text])

  return <div className={clsx("w-full", props.className)} ref={parentRef}></div>
}
