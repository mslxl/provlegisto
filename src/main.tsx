import React from "react"
import ReactDOM from "react-dom/client"
import "normalize.css"
import "./styles.css"
import { getWsIpcPort } from "./lib/ipc"
import Router from "./router"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

Promise.all([getWsIpcPort()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <DndProvider backend={HTML5Backend}>
        <Router />
      </DndProvider>
    </React.StrictMode>,
  )
})
