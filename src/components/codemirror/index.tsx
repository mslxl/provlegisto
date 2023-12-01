import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Compartment } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom, PrimitiveAtom, useAtomValue } from "jotai"
import { Source } from "@/store/source"
import { useImmerAtom } from "jotai-immer"

type CodemirrorProps = {
  className?: string
  sourceAtom: PrimitiveAtom<Source>
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const lspCompartment = useRef<Compartment>(new Compartment())
  const keymapCompartment = useRef<Compartment>(new Compartment())
  const cm = useRef<EditorView | null>(null)
  const [source, patchSource] = useImmerAtom(props.sourceAtom)

  const extensions = {
    lsp: useAtomValue(props.lspAtom),
    keymap: useAtomValue(props.keymapAtom),
  }
  useEffect(() => {
    if (cm.current != null){
      cm.current.dispatch({
        effects: lspCompartment.current.reconfigure(extensions.lsp()),
      })
    }
  }, [extensions.lsp, cm])
  useEffect(() => {
    if (cm.current != null)
      cm.current.dispatch({
        effects: keymapCompartment.current.reconfigure(extensions.keymap()),
      })
  }, [extensions.keymap, cm])

  useEffect(() => {
    if (parentRef.current == null) return
    let isDestroy = false
    let cmClosure: EditorView | null = null

    if (isDestroy) {
      return
    }
    cmClosure = new EditorView({
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        lspCompartment.current.of(extensions.lsp()),
        keymapCompartment.current.of(extensions.keymap()),
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
          patchSource((prev) => {
            prev.code.source = e.state.doc.toString()
          })
        }),
      ],
      doc: source.code.source ?? "",
      parent: parentRef.current!,
    })
    cm.current = cmClosure

    return () => {
      if (cmClosure != null) {
        cmClosure.destroy()
        cmClosure = null
      } else {
        isDestroy = true
      }
    }
  }, [parentRef])

  return <div ref={parentRef} className={clsx("flex items-stretch", props.className)} />
})
export default Codemirror
