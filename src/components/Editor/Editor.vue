<script setup lang="ts">
import { basicSetup } from "codemirror"
import { EditorView, keymap, type ViewUpdate } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { onMounted, onUnmounted, ref } from "vue"
import bus from "../../bus"
import { type Mode, languageSupport, languageServerSupport, setMode } from "./mode"
import { setTheme, themeCompartment } from "./theme"
import { useEditorStore } from "../../store/editor"
import themes from "./themeTable"
import { useSettingStore } from "../../store/settings"

type Props = {
  codeId: string
}
const props = defineProps<Props>()
const block = ref<Element | null>(null)
const editorStore = useEditorStore()
const settingsStore = useSettingStore()
let codemirror: EditorView

editorStore.createIfNotExists(props.codeId)

onMounted(() => {
  codemirror = new EditorView({
    extensions: [
      basicSetup,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (!v.docChanged) return
        editorStore.editors.get(props.codeId)!.code = codemirror.state.doc.toString()
      }),
      keymap.of([indentWithTab]),
      languageSupport.of([]),
      languageServerSupport.of([]),
      themeCompartment.of([]),
      EditorView.theme({
        "&": {
          height: "100%",
          width: "100%",
        },
        "&.cm-editor": {
          outline: "none",
        },
      }),
    ],
    parent: block.value!,
  })

  setTheme((themes as any)[settingsStore.theme], codemirror).catch(console.error)

  bus.on("pref:theme", (v) => {
    const value = String(v)
    settingsStore.theme = value
    void setTheme((themes as any)[value], codemirror)
  })

  bus.on(`externalChange:${props.codeId}`, () => {
    const state = editorStore.editors.get(props.codeId)!
    // 设置语言
    setMode(state.mode, codemirror, props.codeId).catch(console.error)
    // 替换编辑器中所有内容
    codemirror.dispatch({
      changes: [
        {
          from: 0,
          to: codemirror.state.doc.length,
          insert: state.code,
        },
      ],
    })
  })

  bus.on(`modeChange:${props.codeId}`, (e) => {
    editorStore.$patch((state) => {
      state.editors.get(props.codeId)!.mode = e as Mode
    })
    setMode(editorStore.currentEditorValue!.mode, codemirror, props.codeId).catch(console.error)
  })
})

onUnmounted(() => {
  codemirror.destroy()
  bus.off(`modeChange:${props.codeId}`)
  bus.off(`externalChange:${props.codeId}`)
})
</script>
<template>
  <div class="codeblock-wrapper">
    <div ref="block" :class="`codeblock codeblock-${props.codeId}`"></div>
  </div>
</template>
<style lang="scss" scoped>
.codeblock-wrapper {
  flex: 1;
  overflow-y: auto;
}

.codeblock {
  position: relative;
  overflow-y: auto;

  height: 100%;
}
</style>
