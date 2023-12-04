import clsx from "clsx"
import { RefObject, memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Compartment, Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom, PrimitiveAtom, useAtomValue } from "jotai"
import { Source } from "@/store/source"
import { useImmerAtom } from "jotai-immer"
import { map } from "lodash"
import "@fontsource/jetbrains-mono"
import { filterCSSQuote } from "@/lib/utils"
import { editorFontFamily, editorFontSizeAtom } from "@/store/setting/ui"

type CodemirrorProps = {
  className?: string
  sourceAtom: PrimitiveAtom<Source>
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

function useExtensionCompartment<T>(
  cm: RefObject<EditorView | null>,
  atom: Atom<T>,
  builder: (status: T) => Extension,
) {
  const compartment = useRef(new Compartment())
  const value = useAtomValue(atom)
  useEffect(() => {
    if (cm.current == null) return
    console.log("dispatch")
    cm.current.dispatch({
      effects: compartment.current.reconfigure(builder(value)),
    })
  }, [atom, cm, value])
  return () => compartment.current.of(builder(value))
}

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const cm = useRef<EditorView | null>(null)

  const [source, patchSource] = useImmerAtom(props.sourceAtom)

  const configurableExtensions = [
    useExtensionCompartment(cm, props.lspAtom, (v: any) => v()),
    useExtensionCompartment(cm, props.keymapAtom, (v: any) => v()),
    useExtensionCompartment(cm, editorFontSizeAtom, (fontsize) =>
      EditorView.theme({
        "&": {
          "font-size": `${fontsize}px`,
        },
      }),
    ),
    useExtensionCompartment(cm, editorFontFamily, (fontfamily: any) =>
      EditorView.theme({
        "& .cm-content": {
          "font-family": filterCSSQuote(fontfamily),
        },
      }),
    ),
  ]

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
