import React, { lazy } from "react"
import ReactDOM from "react-dom/client"
import { DevTools } from "jotai-devtools"
import { attachConsole } from "tauri-plugin-log-api"
import { loadSettingsStore } from "./store/setting"
import { isDebug } from "./lib/ipc"
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
Promise.all([loadSettingsStore(), attachConsole(), maskContextMenu()])
  .then(() => {
    const Root = lazy(()=>import("@/root"))
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
      <React.StrictMode>
        <Root/>
        <DevTools />
      </React.StrictMode>,
    )
  })
  .catch((e: Error) => {
    document.write(`${e.name}: ${e.message}`)
  })
