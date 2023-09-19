import { Mode } from "../components/editor/editorMode"
import { defineStore } from "pinia"

interface State {
  path?: string
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
          isSaved: false,
          mode,
        })
      })
    },
  },
})

interface EditorState {
  code: string
  mode: Mode
  isSaved: boolean
}
