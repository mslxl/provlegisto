<script setup lang="ts">
import { EditorView, basicSetup } from "codemirror"
import { onMounted, onUnmounted, ref } from "vue"
import bus from "../../bus"
import { type Mode, languageSupport, setMode } from "./editorMode"
import { useEditorStore } from "../../store/editor"

type Props = {
  codeId: string
}
const props = defineProps<Props>()
const block = ref<Element | null>(null)
const editorStore = useEditorStore()
let codemirror: EditorView

editorStore.createIfNotExists(props.codeId)

onMounted(() => {
  codemirror = new EditorView({
    extensions: [basicSetup, languageSupport.of([])],
    parent: block.value!,
  })
  setMode(editorStore.currentEditorValue!.mode, codemirror).catch((e) => {
    console.error(e)
  })

  bus.on(`modeChange:${props.codeId}`, (e) => {
    editorStore.$patch((state) => {
      state.editors.get(props.codeId)!.mode = e as Mode
    })
    setMode(editorStore.currentEditorValue!.mode, codemirror).catch((e) => {
      console.error(e)
    })
  })
})

onUnmounted(() => {
  codemirror.destroy()
  bus.off(`modeChange:${props.codeId}`)
})
</script>
<template>
  <div ref="block" :class="`codeblock-${props.codeId}`"></div>
</template>
<style lang="scss">
.cm-editor.cm-focused {
  outline: none;
}
</style>
