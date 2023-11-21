import { memo, useEffect, useRef } from "react"
import { EditorView, keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { basicSetup } from "codemirror"
import { loadCXXMode } from "./language"
import clsx from "clsx"

type CodemirrorProps = {
  className?: string
  initialSourceCode?: string
  onCurrentSourceCodeChange?: (code: string) => void
}
const Codemirror = memo((props: CodemirrorProps) => {
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (parentRef.current == null) return
    let editor: EditorView | null = null
    let isDestroy = false
    loadCXXMode().then((languageMode) => {
      if (isDestroy) {
        return
      }
      editor = new EditorView({
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          languageMode,
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
    })

    return () => {
      if (editor != null) {
        editor.destroy()
      } else {
        isDestroy = true
      }
    }
  }, [parentRef])

  return <div ref={parentRef} className={clsx("flex items-stretch", props.className)} />
})
export default Codemirror
