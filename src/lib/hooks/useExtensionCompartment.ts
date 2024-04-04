import { filterCSSQuote } from "@/lib/utils"
import { editorFontFamilyAtom, editorFontSizeAtom, editorThemeExtensionAtom } from "@/store/setting/ui"
import { Compartment, Extension } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { Atom, useAtomValue } from "jotai"
import { RefObject, useEffect, useRef } from "react"

export default function useExtensionCompartment<T>(
  cm: RefObject<EditorView | null>,
  atom: Atom<T>,
  builder: (status: T) => Extension,
) {
  const compartment = useRef(new Compartment())
  const value = useAtomValue(atom)
  useEffect(() => {
    if (cm.current == null) return
    cm.current.dispatch({
      effects: compartment.current.reconfigure(builder(value)),
    })
  }, [atom, cm, value])
  return () => compartment.current.of(builder(value))
}

/**
 * Create extension compartments by config
 * Including:
 * - editor colorscheme
 * - font size
 * - font family
 * @param cm 
 * @returns 
 */
export function useCommonConfigurationExtension(cm: RefObject<EditorView | null>) {
  return [
    useExtensionCompartment(cm, editorFontFamilyAtom, (fontfamily: any) =>
      EditorView.theme({
        "& .cm-content": {
          "font-family": filterCSSQuote(fontfamily),
        },
      }),
    ),
    useExtensionCompartment(cm, editorThemeExtensionAtom, (v: any) => v()),
    useExtensionCompartment(cm, editorFontSizeAtom, (fontsize) =>
      EditorView.theme({
        "&": {
          "font-size": `${fontsize}px`,
        },
      }),
    ),
  ]
}
