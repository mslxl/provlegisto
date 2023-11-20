import React from "react"
import ReactDOM from "react-dom/client"
import App from "./pages/App"
import "./styles.css"
import { getWsIpcPort } from "./lib/ipc"

Promise.all([getWsIpcPort()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
