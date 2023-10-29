import { defineStore } from "pinia"
import { syncPreferenceToLocal } from "../lib/syncPref"

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
  cxxCompilerProgram: string
  cxxCompilerArguments: string[]
  clangdProgram: string
  menubarStyle: "native" | "zen"
  terminalProgram: string
  terminalArguments: string[]
}
export const useSettingStore = defineStore("settings", {
  state: (): SettingsState => {
    return {
      theme: "githubLight",
      fontSize: 12,
      fontFamily: '"Fira Code", system-ui, -apple-system',
      zoom: 100,
      testcaseStorageMethod: "text",
      testcaseInputFormat: "{name}_{index}.in",
      testcaseOutputFormat: "{name}_{index}.out",
      testcaseDatabaseFormat: "{name}.db",
      cxxCompilerProgram: "g++",
      cxxCompilerArguments: ["-Wall", "-O2", "-std=c++17"],
      clangdProgram: "clangd",
      cursorKeymap: "none",
      menubarStyle: "native",
      terminalProgram: "",
      terminalArguments: [],
    }
  },
  actions: {
    async syncToLocal() {
      await syncPreferenceToLocal(this.$state)
    },
  },
})
