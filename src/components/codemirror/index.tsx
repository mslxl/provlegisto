import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom, PrimitiveAtom } from "jotai"
import { Source } from "@/store/source"
import { useImmerAtom } from "jotai-immer"
import { concat, map } from "lodash"
import "@fontsource/jetbrains-mono"
import useExtensionCompartment, { generateCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"

type CodemirrorProps = {
  className?: string
  sourceAtom: PrimitiveAtom<Source>
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const cm = useRef<EditorView | null>(null)

  const [source, patchSource] = useImmerAtom(props.sourceAtom)

  const configurableExtensions = concat(
    [
      useExtensionCompartment(cm, props.lspAtom, (v: any) => v()),
      useExtensionCompartment(cm, props.keymapAtom, (v: any) => v()),
    ],
    generateCommonConfigurationExtension(cm),
  )

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
        ...map(configurableExtensions, (e: () => Extension) => e()),
        EditorView.theme({
          "&": {
            "flex-grow": 1,
            outline: "none",
            "min-width": "0px"
          },
          "&.cm-focused": {
            outline: "none",
          },
          "& .cm-lineNumbers": {
            "user-select": "none",
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

  return <div ref={parentRef} className={clsx("flex items-stretch min-w-0", props.className)} />
})
export default Codemirror
