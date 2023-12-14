import "normalize.css"
import "./styles.scss"
import "@fontsource/jetbrains-mono"
import Router from "./router"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { LanguageMode } from "./lib/ipc"
import { useCompetitiveCompanion } from "./hooks/useCompetitiveCompanion"
import { emptySource, useAddSources } from "./store/source"
import { defaultLanguageAtom } from "./store/setting/setup"
import useReadAtom from "./hooks/useReadAtom"

function CompetitiveCompanion() {
  const addSources = useAddSources()
  const readDefaultLanguage = useReadAtom(defaultLanguageAtom)
  useCompetitiveCompanion(async (p) => {
    let title = p.name
    let source = emptySource((await readDefaultLanguage()) ?? LanguageMode.CXX)
    addSources([{ title, source }])
  })
  return null
}

export default function Root() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CompetitiveCompanion />
      <Router />
    </DndProvider>
  )
}
