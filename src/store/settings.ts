import { defineStore } from "pinia"

interface State {
  theme: string
  zoom: number
  menubarStyle: "native" | "zen"
}
export const useSettingStore = defineStore("settings", {
  state: (): State => {
    return {
      theme: "githubLight",
      zoom: 100,
      menubarStyle: "native",
    }
  },
})
