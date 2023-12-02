import React from "react"
import ReactDOM from "react-dom/client"
import "normalize.css"
import "./styles.css"
import "@fontsource/jetbrains-mono"
import Router from "./router"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DevTools } from "jotai-devtools"
import { attachConsole } from "tauri-plugin-log-api"
import { loadSettingsStore } from "./store/setting"
import { LanguageMode, isDebug } from "./lib/ipc"
import { useCompetitiveCompanion } from "./hooks/useCompetitiveCompanion"
import { Source, useAddSource } from "./store/source"

async function maskContextMenu() {
  const debug = await isDebug()
  if (!debug) {
    document.oncontextmenu = (event) => event.preventDefault()
  }
}

function CompetitiveCompanion() {
  const addSource = useAddSource()
  useCompetitiveCompanion((p) => {
    let title = p.name
    let source: Source = {
      url: p.url,
      contest: p.group,
      code: {
        language: LanguageMode.CXX,
        source: "",
      },
      test: {
        timeLimits: p.timeLimit,
        memoryLimits: p.memoryLimit,
        checker: "wcmp",
        testcases: p.tests,
      },
    }
    addSource(title, source)
  })
  return null
}

function Root() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CompetitiveCompanion />
      <Router />
    </DndProvider>
  )
}

Promise.all([attachConsole(), loadSettingsStore(), maskContextMenu()])
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <Root />
        <DevTools />
      </React.StrictMode>,
    )
  })
  .catch((e: Error) => {
    document.write(`${e.name}: ${e.message}`)
  })
