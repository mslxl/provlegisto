import "./styles.scss"
import { createApp } from "vue"
import { createPinia } from "pinia"

import App from "./App.vue"
import router from "./router"
import { attachConsole } from "tauri-plugin-log-api"

attachConsole().catch(console.error)
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount("#app")
