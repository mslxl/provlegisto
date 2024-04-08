import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom, useAtomValue } from "jotai"
import { Source } from "@/store/source/model"
import { concat, map } from "lodash/fp"
import "@fontsource/jetbrains-mono"
import useExtensionCompartment, { useCommonConfigurationExtension } from "@/lib/hooks/useExtensionCompartment"
import { UndoManager } from "yjs"
// @ts-ignore
import { yCollab } from "y-codemirror.next"
import { awarenessAtom } from "@/store/source"

type CodemirrorProps = {
  className?: string
  title: string
  source: Source
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

const EditorViewStyle = EditorView.theme({
  "&": {
    "flex-grow": 1,
    outline: "none",
    "min-width": "0px",
  },
  "&.cm-focused": {
    outline: "none",
  },
  "& .cm-lineNumbers": {
    "user-select": "none",
  },
})

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const cm = useRef<EditorView | null>(null)

  const configurableExtensions = concat(
    [
      useExtensionCompartment(cm, props.lspAtom, (v: any) => v()),
      useExtensionCompartment(cm, props.keymapAtom, (v: any) => v()),
    ],
    useCommonConfigurationExtension(cm),
  )

  const awareness = useAtomValue(awarenessAtom)

  useEffect(() => {
    if (parentRef.current == null) return
    let isDestroy = false
    let cmClosure: EditorView | null = null

    if (isDestroy) {
      return
    }

    const undoManager = new UndoManager(props.source.source)

    cmClosure = new EditorView({
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        ...map((e: () => Extension) => e(), configurableExtensions),
        EditorViewStyle,
        // use ycollab to modify and share source object
        //TODO: add awareness
        yCollab(props.source.source, awareness, { undoManager }),
      ],
      doc: props.source.source.toString(),
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
  }, [parentRef, props.source])

  return <div ref={parentRef} className={clsx("flex items-stretch min-w-0", props.className)} />
})

export default Codemirror
