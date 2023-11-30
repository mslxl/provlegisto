import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Compartment } from "@codemirror/state"
import { KeymapProvider } from "./keymap"

type CodemirrorProps = {
  className?: string
  initialSourceCode?: string
  onCurrentSourceCodeChange?: (code: string) => void
  lsp: LspProvider
  keymap: KeymapProvider
}
const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)
  const lspCompartment = useRef<Compartment>(new Compartment())
  const keymapCompartment = useRef<Compartment>(new Compartment())
  const cm = useRef<EditorView | null>(null)

  useEffect(() => {
    if (cm.current != null) {
      const editor = cm.current
      props.lsp().then((lsp) => {
        editor.dispatch({
          effects: lspCompartment.current.reconfigure(lsp),
        })
      })
    }
  }, [props.lsp, cm])

  useEffect(() => {
    if (cm.current != null) {
      const editor = cm.current
      props.keymap().then((keymap) => {
        editor.dispatch({
          effects: keymapCompartment.current.reconfigure(keymap),
        })
      })
    }
  }, [props.keymap, cm])

  useEffect(() => {
    if (parentRef.current == null) return
    let isDestroy = false
    let cmClosure: EditorView | null = null

    Promise.all([props.lsp(), props.keymap()]).then(([lspExt, keymapExt]) => {
      if (isDestroy) {
        return
      }
      cm.current = new EditorView({
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          lspCompartment.current.of(lspExt),
          keymapCompartment.current.of(keymapExt),
          EditorView.theme({
            "&": {
              "flex-grow": 1,
              outline: "none",
            },
            "&.cm-focused": {
              outline: "none",
            },
          }),
          EditorView.updateListener.of((e) => {
            if (!e.docChanged) return
            if (!props.onCurrentSourceCodeChange) return
            props.onCurrentSourceCodeChange(e.state.doc.toString())
          }),
        ],
        doc: props.initialSourceCode ?? "",
        parent: parentRef.current!,
      })
      cmClosure = cm.current
    })

    return () => {
      if (cmClosure != null) {
        cmClosure = cm.current
        cmClosure = null
      } else {
        isDestroy = true
      }
    }
  }, [parentRef])

  return <div ref={parentRef} className={clsx("flex items-stretch", props.className)} />
})
export default Codemirror
