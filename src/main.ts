import "normalize.css"
import "@fontsource/noto-sans-mono"
import "./styles.scss"
import { createApp } from "vue"

import App from "./App.vue"
import router from "./router"
import { createPresistedSettings } from "./lib/presistedSettings"
;(async () => {
  const app = createApp(App)
  const pinia = await createPresistedSettings()
  app.use(router)
  app.use(pinia)
  app.mount("#app")
})().catch(console.error)
