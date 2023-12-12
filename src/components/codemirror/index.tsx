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
import useTimeoutInvoke from "@/hooks/useTimeoutInvoke"
import * as cache from "@/lib/fs/cache"
import { useMitt } from "@/hooks/useMitt"
import { PeerProvider } from "./peer"

type CodemirrorProps = {
  className?: string
  id: number
  title: string
  sourceAtom: PrimitiveAtom<Source>
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
  peerAtom: Atom<Promise<ReturnType<PeerProvider>>>
}

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const cm = useRef<EditorView | null>(null)

  const [source, patchSource] = useImmerAtom(props.sourceAtom)

  const configurableExtensions = concat(
    [
      useExtensionCompartment(cm, props.lspAtom, (v: any) => v()),
      useExtensionCompartment(cm, props.keymapAtom, (v: any) => v()),
      useExtensionCompartment(cm, props.peerAtom, (v:any) => v(props.id)),
    ],
    generateCommonConfigurationExtension(cm),
  )

  const [doCacheOnTimeout, , cancelTimeoutCache] = useTimeoutInvoke<never>(() => {
    cache.updateCache(props.id, props.title, source)
  }, 1000)
  useMitt("cache", (id) => {
    if (id == props.id || id == -1) doCacheOnTimeout({} as never)
  })

  useEffect(() => {
    doCacheOnTimeout({} as never)
  }, [props.title])

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
            "min-width": "0px",
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
          // update program status
          patchSource((prev) => {
            prev.code.source = e.state.doc.toString()
          })
          // cache file
          doCacheOnTimeout({} as never)
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
        cancelTimeoutCache()
      } else {
        isDestroy = true
      }
    }
  }, [parentRef])

  return <div ref={parentRef} className={clsx("flex items-stretch min-w-0", props.className, `debug-id-${props.id}`)} />
})
export default Codemirror
