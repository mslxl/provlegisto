import Codemirror from "@/components/codemirror"
import { cxxLsp, noLsp, pyLsp } from "@/components/codemirror/language"
import { LanguageMode } from "@/lib/ipc"
import { keymapExtensionAtom } from "@/store/setting/keymap"
import { SourceHeader, activeIdAtom, sourceStoreAtom } from "@/store/source"
import clsx from "clsx"
import { PrimitiveAtom, atom, useAtomValue } from "jotai"
import { focusAtom } from "jotai-optics"
import { Suspense, useMemo } from "react"

type EditorProps = {
  className?: string
  headerAtom: PrimitiveAtom<SourceHeader>
}
export default function EditorTabPanel(props: EditorProps) {
  const header = useAtomValue(props.headerAtom)
  const active = useAtomValue(activeIdAtom)
  const sourceAtom = useMemo(() => focusAtom(sourceStoreAtom, (optic) => optic.prop(header.id)), [header.id])
  const sourceCodeLanguageAtom = useMemo(
    () => focusAtom(sourceStoreAtom, (optic) => optic.prop(header.id).prop("code").prop("language")),
    [header.id],
  )
  const sourceCodeLanguage = useAtomValue(sourceCodeLanguageAtom)

  const lspExtensionAtom = useMemo(() => {
    return atom(() => {
      if (sourceCodeLanguage == LanguageMode.CXX) return cxxLsp()
      else if (sourceCodeLanguage == LanguageMode.PY) return pyLsp()
      return noLsp()
    })
  }, [sourceCodeLanguage])
  return (
    <Suspense>
      <Codemirror
        className={clsx(props.className, {
          hidden: active != header.id,
        })}
        sourceAtom={sourceAtom}
        keymapAtom={keymapExtensionAtom}
        lspAtom={lspExtensionAtom}
      />
    </Suspense>
  )
}
