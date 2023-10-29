import { map, prop, sortBy } from "ramda"
import { type Mode } from "../codemirror/mode"
import { defineStore } from "pinia"

interface State {
  lspPort: number
  editors: Map<string, EditorState>
  currentEditor: string | null
}

export const useTabs = defineStore("tabs", {
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
      return map(
        prop("name"),
        sortBy(
          prop("sort"),
          map(
            (entry): any => ({
              name: entry[0],
              sort: entry[1].indexSort,
            }),
            Array.from(state.editors.entries()),
          ),
        ),
      )
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
          indexSort: state.editors.size,
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
        v.testcase.push({ multable: true, input: "", output: "" })
      })
    },
  },
})

interface UserTestcase {
  multable: true
  input: string
  output: string
}
interface ExternalTestcase {
  multable: false
  inputFlie: string
  inputOverview: string
  outputFile: string
  outputOverview: string
}

export type Testcase = UserTestcase | ExternalTestcase

interface EditorState {
  indexSort: number
  code: string
  mode: Mode
  isSaved: boolean
  path: string | null
  testcase: Testcase[]
}
