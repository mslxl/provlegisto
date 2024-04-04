import { useCompetitiveCompanion } from "@/lib/hooks/useCompetitiveCompanion"
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "@/store/setting/setup"
import { createSourceAtom } from "@/store/source"
import { useAtomValue, useSetAtom } from "jotai"
import { forEach, range, zip } from "lodash/fp"

export default function CompetitiveCompanion() {
  const defaultLanguage = useAtomValue(defaultLanguageAtom)
  const createSource = useSetAtom(createSourceAtom)
  useCompetitiveCompanion((p) => {
    const source = createSource(defaultLanguage ?? LanguageMode.CXX, p.timeLimit, p.memoryLimit, p.name) //TODO: narrow its type
    source.url = p.url
    source.contestUrl = p.url
    source.source.insert(0, "") //TODO: source code template
    source.checker = "wcmp"
    forEach(
      ([t, i]) => {
        source.pushEmptyTest()
        const test = source.getTest(i!)
        test.input.insert(0, t!.input)
        test.except.insert(0, t!.output)
      },
      zip(p.tests, range(0, p.tests.length)),
    )
  })
  return null
}