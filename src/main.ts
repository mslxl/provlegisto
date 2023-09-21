import "./styles.scss"
import { createApp } from "vue"

import App from "./App.vue"
import router from "./router"
import { attachConsole } from "tauri-plugin-log-api"
import { createPresistedPinia } from "./lib/presistedPinia"
;(async () => {
  await attachConsole()
  const app = createApp(App)
  const pinia = await createPresistedPinia()
  app.use(router)
  app.use(pinia)
  app.mount("#app")
})().catch(console.error)
