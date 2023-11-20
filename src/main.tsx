import React from "react"
import ReactDOM from "react-dom/client"
import "normalize.css"
import "./styles.css"
import { getWsIpcPort } from "./lib/ipc"
import Router from "./router"

Promise.all([getWsIpcPort()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <Router />
    </React.StrictMode>,
  )
})
