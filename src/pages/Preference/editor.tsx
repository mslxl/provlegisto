import { themeListItemAtom } from "@/components/codemirror/theme"
import Editor from "@/components/editor"
import { PrefNumber } from "@/components/pref/Number"
import PrefSelect from "@/components/pref/Select"
import { PrefText } from "@/components/pref/Text"
import { editorFontFamilyAtom, editorFontSizeAtom, editorThemeAtom } from "@/store/setting/ui"
import { useAtom, useAtomValue } from "jotai"

export default function Page() {
  const themeItems = useAtomValue(themeListItemAtom)
  const [editorTheme, setEditorTheme] = useAtom(editorThemeAtom)
  const [editorFontSize, setEditorFontSize] = useAtom(editorFontSizeAtom)
  const [editorFontFamily, setEditorFontFamily] = useAtom(editorFontFamilyAtom)


  return (
    <ul>
      <li>
        <div className="shadow-md bg-zinc-200 min-w-0">
          <Editor
            className="min-w-0"
            text={
              'The quick fox jump over the lazy dog\nif 2 != 1 && 3 >= 2 {\n\tprintln!("=== greet from {}", "provlegisto");\n } '
            }
          />
        </div>
      </li>
      <li>
        <PrefSelect leading="Theme" items={themeItems} value={editorTheme} onChange={setEditorTheme}/>
      </li>
      <li>
        <PrefNumber leading="Editor Font Size" step={1} min={1} value={editorFontSize} onChange={setEditorFontSize}/>
      </li>
      <li>
        <PrefText leading="Editor Font" value={editorFontFamily} onChange={setEditorFontFamily} />
      </li>
    </ul>
  )
}
