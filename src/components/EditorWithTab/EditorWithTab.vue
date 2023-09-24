<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import Editor from "../Editor/Editor.vue"
import bus from "../../bus"
import * as file from "./file"
import { useEditorStore } from "../../store/editor"
import { compileFile, runDetached } from "../../lib/cp"

const editorStore = useEditorStore()

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
  <Editor code-id="main" />
</template>
