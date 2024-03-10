import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom } from "jotai"
import { Source } from "@/store/source/model"
import { concat, map } from "lodash"
import "@fontsource/jetbrains-mono"
import useExtensionCompartment, { useCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"
import useTimeoutInvoke from "@/hooks/useTimeoutInvoke"
import * as cache from "@/lib/fs/cache"
import { useMitt } from "@/hooks/useMitt"
import { UndoManager } from "yjs"
// @ts-ignore
import { yCollab } from 'y-codemirror.next'

type CodemirrorProps = {
  className?: string
  title: string
  source: Source
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

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
  // TODO: modify store via collab extension

  // TODO: auto save
  // const [doCacheOnTimeout, , cancelTimeoutCache] = useTimeoutInvoke<never>(() => {
  //   cache.updateCache(props.id, props.title, source)
  // }, 1000)
  // useMitt("cache", (id) => {
  //   if (id == props.id || id == -1) doCacheOnTimeout({} as never)
  // })

  // useEffect(()=>{
  //   doCacheOnTimeout({} as never)
  // }, [props.title])

  useEffect(() => {
    if (parentRef.current == null) return
    let isDestroy = false
    let cmClosure: EditorView | null = null

    if (isDestroy) {
      return
    }

    //TODO: add awareness
    const undoManager = new UndoManager(props.source.source)


    cmClosure = new EditorView({
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        ...map(configurableExtensions, (e: () => Extension) => e()),
        EditorView.theme({
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
        }),
        yCollab(props.source.source, null, {undoManager}),
        EditorView.updateListener.of((e) => {
          if (!e.docChanged) return
          // TODO: auto save
          // doCacheOnTimeout({} as never)
        }),
      ],
      doc: props.source.source.toString(),
      parent: parentRef.current!,
    })
    cm.current = cmClosure

    return () => {
      if (cmClosure != null) {
        cmClosure.destroy()
        cmClosure = null
        // TODO: auto save
        // cancelTimeoutCache()
      } else {
        isDestroy = true
      }
    }
  }, [parentRef])

  return <div ref={parentRef} className={clsx("flex items-stretch min-w-0", props.className)} />
})

export default Codemirror
