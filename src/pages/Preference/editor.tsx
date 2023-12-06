import { themeListItemAtom } from "@/components/codemirror/theme"
import Editor from "@/components/editor"
import { PrefNumber } from "@/components/pref"
import PrefSelect from "@/components/pref/Select"
import { PrefText } from "@/components/pref/Text"
import { editorFontFamilyAtom, editorFontSizeAtom, editorThemeAtom } from "@/store/setting/ui"
import { useAtomValue } from "jotai"

export default function Page() {
  const themeItems = useAtomValue(themeListItemAtom)
  return (
    <ul>
      <li>
        <div className="shadow-md bg-zinc-200 min-w-0">
          <Editor
            className="min-w-0"
            text={
              'The quick fox jump over the lazy dog\nif 2 != 1 && 3 >= 2 {\n\tprintln!("=== greet from {}", "provlegisto");\n } '
            }
            kernel="codemirror"
          />
        </div>
      </li>
      <li>
        <PrefSelect leading="Theme" items={themeItems} atom={editorThemeAtom as any} />
      </li>
      <li>
        <PrefNumber leading="Editor Font Size" atom={editorFontSizeAtom as any} step={1} min={1} />
      </li>
      <li>
        <PrefText leading="Editor Font" atom={editorFontFamilyAtom as any} />
      </li>
    </ul>
  )
}
