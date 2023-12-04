import { PrefNumber } from "@/components/pref"
import { PrefText } from "@/components/pref/Text"
import { filterCSSQuote } from "@/lib/utils"
import { editorFontFamily, editorFontSizeAtom } from "@/store/setting/ui"
import { useAtomValue } from "jotai"
import styled from "styled-components"

const FontDisplay = styled.p<{ fontFamily: string; fontSize: number }>`
  text-align: center;
  font-size: ${(props) => props.fontSize}px;
  font-family: ${(props) => filterCSSQuote(props.fontFamily)};
`

export default function Page() {
  const fontFamily = useAtomValue(editorFontFamily)
  const fontSize = useAtomValue(editorFontSizeAtom)
  return (
    <ul>
      <li>
        <PrefNumber leading="Editor Font Size" atom={editorFontSizeAtom as any} step={1} min={1} />
      </li>
      <li>
        <PrefText leading="Editor Font" atom={editorFontFamily as any} />
        <div className="shadow-md p-2 bg-zinc-200">
          <FontDisplay fontSize={fontSize} fontFamily={fontFamily}>The quick fox jump over the lazy dog</FontDisplay>
          <FontDisplay fontSize={fontSize} fontFamily={fontFamily}>
            {'if 2 != 1 && 3 >= 2 { println!("=== greet from {}", "provlegisto") } '}{" "}
          </FontDisplay>
        </div>
      </li>
    </ul>
  )
}
