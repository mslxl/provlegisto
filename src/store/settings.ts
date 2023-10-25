import { defineStore } from "pinia"

export interface SettingsState {
  theme: string
  fontSize: number
  fontFamily: string
  zoom: number
  cursorKeymap: string
  testcaseStorageMethod: string
  testcaseInputFormat: string
  testcaseOutputFormat: string
  testcaseDatabaseFormat: string
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
      testcaseStorageMethod: "text",
      testcaseInputFormat: "{name}_{index}.in",
      testcaseOutputFormat: "{name}_{index}.out",
      testcaseDatabaseFormat: "{name}.db",
      cursorKeymap: "none",
      menubarStyle: "native",
      terminalProgram: "",
      terminalArguments: [],
    }
  },
})
