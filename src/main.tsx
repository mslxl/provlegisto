import "normalize.css"
import "@fontsource/jetbrains-mono"
import "./styles.scss"
import store from "./store"
import React from "react"
import ReactDOM from "react-dom/client"
import Router from "./router"
import CompetitiveCompanion from "./components/cplistener"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { attachConsole } from "tauri-plugin-log-api"
import { loadSettingsStore } from "./store/setting"
import { isDebug } from "./lib/ipc"
import { dialog } from "@tauri-apps/api"
import { Provider } from "jotai"
import { DevTools } from "jotai-devtools"

async function maskContextMenu() {
  const debug = await isDebug()
  if (!debug) {
    document.oncontextmenu = (event) => event.preventDefault()
    document.addEventListener("keydown", (e) => {
      if (e.key == "r" && e.ctrlKey) {
        e.preventDefault()
      }
    })
  }
}


function Root() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <CompetitiveCompanion />
        <Router />
        <DevTools />
      </DndProvider>
    </Provider>
  )
}

Promise.all([attachConsole(), loadSettingsStore(), maskContextMenu()])
  .then(() => {
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <Root />
      </React.StrictMode>,
    )
  })
  .catch((e: Error) => {
    dialog.message(e.message, {
      title: "Init error",
      type: "error",
    })
  })
