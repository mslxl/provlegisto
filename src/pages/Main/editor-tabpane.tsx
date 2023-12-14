import Codemirror from "@/components/codemirror"
import { cxxLsp, noLsp, pyLsp } from "@/components/codemirror/language"
import useReadAtom from "@/hooks/useReadAtom"
import { LanguageMode } from "@/lib/ipc"
import { keymapExtensionAtom } from "@/store/setting/keymap"
import { clangdPathAtom, pyrightsPathAtom } from "@/store/setting/setup"
import { SourceHeader, activeIdAtom, sourceStoreAtom } from "@/store/source"
import { Extension } from "@codemirror/state"
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

  // init lsp
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
      <Codemirror
        className={clsx(props.className, {
          hidden: active != header.id,
        })}
        sourceAtom={sourceAtom}
        id={header.id}
        title={header.title}
        keymapAtom={keymapExtensionAtom}
        lspAtom={lspExtensionAtom}
      />
    </Suspense>
  )
}
