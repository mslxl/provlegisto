<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import Editor from "../Editor/Editor.vue"
import HSplit from "../SplitPane/HSplitPane.vue"
import bus from "../../bus"
import * as file from "./file"
import { useEditorStore } from "../../store/editor"
import { compileFile, runDetached } from "../../lib/cp"
import TestcaseBox from "../Testcase/Testcase.vue"

const editorStore = useEditorStore()

const sideWith = ref(450)

onMounted(() => {
  file.listen()
  bus.on("menu:compile", () => {
    const cur = editorStore.currentEditorValue!
    bus.emit("notify:info", { title: "Start Compile" })
    compileFile(cur.mode, cur.code, []).catch((e) => {
      bus.emit("notify:error", {
        title: "Compile Error",
        content: e,
      })
    })
  })
  bus.on("menu:runDetached", () => {
    const cur = editorStore.currentEditorValue!
    bus.emit("notify:info", { title: "Start Compile" })
    runDetached(cur.mode, cur.code, []).catch((e) => {
      bus.emit("notify:error", {
        title: "Compile Error",
        content: e,
      })
    })
  })
})
onUnmounted(() => {
  file.unlisten()
  bus.off("menu:compile")
  bus.off("menu:runDetached")
})
</script>

<template>
  <HSplit v-model:side-width="sideWith" class="editor-split-pane">
    <template #main>
      <Editor code-id="main" />
    </template>
    <template #right>
      <TestcaseBox code-id="main" />
    </template>
  </HSplit>
</template>

<style scoped lang="scss">
.editor-split-pane {
  flex: 1;
}
</style>
