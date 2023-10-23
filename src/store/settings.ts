import { defineStore } from "pinia"

export interface SettingsState {
  theme: string
  fontSize: number
  fontFamily: string
  zoom: number
  menubarStyle: "native" | "zen"
  terminalProgram: string
  terminalArguments: string[]
}
export const useSettingStore = defineStore("settings", {
  state: (): SettingsState => {
    return {
      theme: "githubLight",
      fontSize: 12,
      fontFamily:
        'v-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      zoom: 100,
      menubarStyle: "native",
      terminalProgram: "",
      terminalArguments: [],
    }
  },
})
