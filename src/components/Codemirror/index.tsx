import { useEffect, useRef } from "react"
import { EditorView } from "@codemirror/view"
import { basicSetup } from "codemirror"
import { loadPYMode } from "./language"

function Codemirror() {
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (parentRef.current == null) return
    let editor: EditorView | null = null
    let isDestroy = false
    loadPYMode().then((languageMode) => {
      if (isDestroy) {
        return
      }
      editor = new EditorView({
        extensions: [
          basicSetup,
          languageMode,
          EditorView.theme({
            ".cm-editor": {
              width: "100%",
              height: "100%",
            },
          }),
        ],
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

  return <div ref={parentRef} className="w-full h-full flex-1" />
}

export default Codemirror
