import "./styles.scss"
import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import { attachConsole } from "tauri-plugin-log-api"

await attachConsole()
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount("#app")
