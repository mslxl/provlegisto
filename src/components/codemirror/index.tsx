import clsx from "clsx"
import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { LspProvider } from "./language"
import { Compartment, Extension } from "@codemirror/state"
import { KeymapProvider } from "./keymap"
import { Atom, PrimitiveAtom, useAtomValue } from "jotai"
import { Source, activeIdAtom } from "@/store/source"
import { useImmerAtom } from "jotai-immer"
import { concat, map } from "lodash"
import "@fontsource/jetbrains-mono"
import useExtensionCompartment, { generateCommonConfigurationExtension } from "@/hooks/useExtensionCompartment"
import useTimeoutInvoke from "@/hooks/useTimeoutInvoke"
import { useMitt } from "@/hooks/useMitt"
import { collabDocumentAtom, collabProviderAtom } from "@/store/collab"
import { UndoManager } from "yjs"
import * as cache from "@/lib/fs/cache"
import * as log from "tauri-plugin-log-api"
// @ts-ignore
import { yCollab } from "y-codemirror.next"

type CodemirrorProps = {
  className?: string
  id: number
  title: string
  sourceAtom: PrimitiveAtom<Source>
  lspAtom: Atom<ReturnType<LspProvider>>
  keymapAtom: Atom<ReturnType<KeymapProvider>>
}

const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const cm = useRef<EditorView | null>(null)

  const [source, patchSource] = useImmerAtom(props.sourceAtom)
  const ydoc = useAtomValue(collabDocumentAtom)
  const collabProvider = useAtomValue(collabProviderAtom)

  const yCollabCompartment = useRef(new Compartment())
  const ytext = ydoc.getText(`src-${source.uuid}`)
  const undoManager = new UndoManager(ytext)
  const activeId = useAtomValue(activeIdAtom)

  // init yjs text status
  const valueInit = useRef(false)
  useEffect(() => {
    if (!valueInit.current) {
      valueInit.current = true
      if (source.code.source != "") {
        ytext.insert(0, source.code.source)
      }
    }
  }, [])

  // update jotai status via ytext
  useEffect(() => {
    const updater = () =>
      patchSource((pre) => {
        pre.code.source = ytext.toString()
      })
    ytext.observe(updater)
    return () => ytext.unobserve(updater)
  }, [patchSource])

  // update yCollab extension when webrtc-provider changed
  useEffect(() => {
    if (cm.current == null) return
    if (collabProvider == null || props.id != activeId) {
      log.info(`dispatch collab to document ${props.id}`)
      cm.current.dispatch({
        effects: yCollabCompartment.current.reconfigure(yCollab(ytext, undefined, { undoManager })),
      })
    } else {
      log.info(`dispatch collab to document ${props.id} with awareness`)
      cm.current.dispatch({
        effects: yCollabCompartment.current.reconfigure(yCollab(ytext, collabProvider.awareness, { undoManager })),
      })
    }
  }, [collabProvider, activeId, cm])

  // common config
  const configurableExtensions = concat(
    [
      useExtensionCompartment(cm, props.lspAtom, (v: any) => v()),
      useExtensionCompartment(cm, props.keymapAtom, (v: any) => v()),
    ],
    generateCommonConfigurationExtension(cm),
  )

  // deal with timeout caching
  const [doCacheOnTimeout, , cancelTimeoutCache] = useTimeoutInvoke<never>(() => {
    cache.updateCache(props.id, props.title, source)
  }, 1000)

  useMitt("cache", (id) => {
    if (id == props.id || id == -1) doCacheOnTimeout({} as never)
  })

  useEffect(() => {
    doCacheOnTimeout({} as never)
  }, [props.title])

  // create editor
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
        yCollabCompartment.current.of(yCollab(ytext, undefined, { undoManager })),
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
      doc: ytext.toString(),
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
