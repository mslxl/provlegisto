import { Mode } from "../codemirror/mode"
import { defineStore } from "pinia"

interface State {
  editors: Map<string, EditorState>
  currentEditor: string | null
}

export const useEditorStore = defineStore("editor", {
  state: (): State => {
    return {
      currentEditor: null,
      editors: new Map<string, EditorState>(),
    }
  },
  getters: {
    currentEditorValue(state): EditorState | null {
      if (state.currentEditor == null) return null
      return state.editors.get(state.currentEditor) as EditorState
    },
  },
  actions: {
    createIfNotExists(id: string, mode: Mode = Mode.cpp) {
      if (!this.editors.has(id)) {
        this.create(id, mode)
      }
    },
    create(id: string, mode: Mode = Mode.cpp) {
      this.$patch((state) => {
        state.editors.set(id, {
          code: "",
          path: null,
          isSaved: false,
          mode,
          testcase: [],
        })
      })
    },
    updateTestcase(id: string, index: number, updater: (value: Testcase) => void) {
      this.$patch((state) => {
        const v = state.editors.get(id)!
        updater(v.testcase[index])
      })
    },
    addTestcase(id: string) {
      this.$patch((state) => {
        const v = state.editors.get(id)!
        v.testcase.push({ input: "", output: "" })
      })
    },
  },
})

interface Testcase {
  input: string
  output: string
}

interface EditorState {
  code: string
  mode: Mode
  isSaved: boolean
  path: string | null
  testcase: Testcase[]
}
