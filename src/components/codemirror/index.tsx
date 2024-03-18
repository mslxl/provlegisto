import clsx from "clsx"
import { memo, useCallback, useEffect, useMemo, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom } from "jotai"
import { Source } from "@/store/source/model"
import { concat, map } from "lodash/fp"
import "@fontsource/jetbrains-mono"
import useExtensionCompartment, { useCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"
import { UndoManager } from "yjs"
import cache from "@/lib/fs/cache"
// @ts-ignore
import { yCollab } from "y-codemirror.next"
import { fromSource } from "@/lib/fs/model"

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

  const buildStaticSourceforCache = useCallback(() => fromSource(props.source), [props.source])
  const cacheUpdateListenerExtension = useMemo(
    () =>
      EditorView.updateListener.of((e) => {
        if (!e.docChanged) return
        cache.debouncedUpdateCache(props.source.id, buildStaticSourceforCache)
      }),
    [props.source],
  )

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
        yCollab(props.source.source, null, { undoManager }),
        cacheUpdateListenerExtension,
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
