<script setup lang="ts">
import { EditorView, basicSetup } from "codemirror"
import { onMounted, onUnmounted, ref } from "vue"
import editorBus from "../../bus/editorBus"
import { languageSupport, setMode } from "./editorMode"
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

  editorBus.on(`modeChange:${props.codeId}`, () => {
    setMode(editorStore.currentEditorValue!.mode, codemirror).catch((e) => {
      console.error(e)
    })
  })
})

onUnmounted(() => {
  codemirror.destroy()
  editorBus.off(`modeChange:${props.codeId}`)
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
