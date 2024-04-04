import Codemirror from "@/components/codemirror"
import { cxxLsp, noLsp, pyLsp } from "@/components/codemirror/language"
import useReadAtom from "@/lib/hooks/useReadAtom"
import { LanguageMode } from "@/lib/ipc"
import { keymapExtensionAtom } from "@/store/setting/keymap"
import { clangdPathAtom, pyrightsPathAtom } from "@/store/setting/setup"
import { Source } from "@/store/source/model"
import { Extension } from "@codemirror/state"
import { atom } from "jotai"
import { Suspense, useMemo } from "react"

type EditorProps = {
  className?: string
  source: Source
}
export default function EditorTabPanel(props: EditorProps) {
  props.source.language
  const sourceCodeLanguage = props.source.useLanguage()
  const title = props.source.useName()

  const readClangdPath = useReadAtom(clangdPathAtom)
  const readPyrightsPath = useReadAtom(pyrightsPathAtom)

  const lspExtensionAtom = useMemo(() => {
    return atom(async (): Promise<() => Extension> => {
      if (sourceCodeLanguage == LanguageMode.CXX) return cxxLsp(await readClangdPath())
      else if (sourceCodeLanguage == LanguageMode.PY) return pyLsp(await readPyrightsPath())
      return noLsp("")
    })
  }, [sourceCodeLanguage])

  return (
    <Suspense>
      <Codemirror className={props.className} source={props.source} title={title} keymapAtom={keymapExtensionAtom} lspAtom={lspExtensionAtom} />
    </Suspense>
  )
}
