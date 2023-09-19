import { defineStore } from "pinia"

interface State {
  menubarStyle: "native" | "zen"
}
export const useSettingStore = defineStore("settings", {
  state: (): State => {
    return {
      menubarStyle: "native",
    }
  },
})
