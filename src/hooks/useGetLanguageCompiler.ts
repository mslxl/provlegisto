import { gccPathAtom, pythonPathAtom } from "@/store/setting/setup"
import useReadAtom from "./useReadAtom"
import { LanguageMode } from "@/lib/ipc"

export default function useGetLanguageCompiler(): (lang: LanguageMode) => Promise<string | null> {
  const readGccPath = useReadAtom(gccPathAtom)
  const readPyPath = useReadAtom(pythonPathAtom)

  return (lang): Promise<string | null> => {
    if (lang == LanguageMode.CXX) return readGccPath() as any
    else if (lang == LanguageMode.PY) return readPyPath() as any
    return new Promise((resolve) => {
      resolve(null)
    })
  }
}
