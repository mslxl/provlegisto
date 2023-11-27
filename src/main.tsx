import React from "react"
import ReactDOM from "react-dom/client"
import "normalize.css"
import "./styles.css"
import Router from "./router"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DevTools } from "jotai-devtools"
import { attachConsole } from "tauri-plugin-log-api"

document.oncontextmenu = (event) => event.preventDefault()

attachConsole().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
        <Router />
      </DndProvider>
      <DevTools />
    </React.StrictMode>,
  )
})