import { defineStore } from "pinia"

interface State {
  theme: string
  zoom: number
  menubarStyle: "native" | "zen"
  terminalProgram: string
  terminalArguments: string[]
}
export const useSettingStore = defineStore("settings", {
  state: (): State => {
    return {
      theme: "githubLight",
      zoom: 100,
      menubarStyle: "native",
      terminalProgram: "",
      terminalArguments: [],
    }
  },
})
