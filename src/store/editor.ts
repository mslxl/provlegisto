import { type Mode } from "../codemirror/mode"
import { defineStore } from "pinia"

interface State {
  lspPort: number
  editors: Map<string, EditorState>
  currentEditor: string | null
}

export const useEditorStore = defineStore("editor", {
  state: (): State => {
    return {
      lspPort: 0,
      currentEditor: null,
      editors: new Map<string, EditorState>(),
    }
  },
  getters: {
    currentEditorValue(state): EditorState | null {
      if (state.currentEditor == null) return null
      return state.editors.get(state.currentEditor) as EditorState
    },
    /**
     * Return all keys of editor
     * @param state
     * @returns keys
     */
    ids(state): string[] {
      return Array.from(state.editors.keys())
    },
  },
  actions: {
    createIfNotExists(id: string, mode: Mode) {
      if (!this.editors.has(id)) {
        this.create(id, mode)
      }
    },
    create(id: string, mode: Mode) {
      this.$patch((state) => {
        state.editors.set(id, {
          name: id,
          code: "",
          path: null,
          isSaved: true,
          mode,
          testcase: [],
        })
      })
    },
    remove(id: string) {
      this.$patch((state) => {
        if (state.currentEditor === id) {
          // TODO: 倒退到上一个编辑器
          state.currentEditor = null
        }
        state.editors.delete(id)
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
  name: string
  code: string
  mode: Mode
  isSaved: boolean
  path: string | null
  testcase: Testcase[]
}
