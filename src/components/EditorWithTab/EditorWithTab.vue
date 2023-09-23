<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import Editor from "../Editor/Editor.vue"
import bus from "../../bus"
import * as file from "./file"
import { useEditorStore } from "../../store/editor"
import { compileFile, runDetached } from "../../lib/cp"
import { error } from "tauri-plugin-log-api"

const editorStore = useEditorStore()

onMounted(() => {
  file.listen()
  bus.on("menu:compile", () => {
    const cur = editorStore.currentEditorValue!
    compileFile(cur.mode, cur.path!, []).catch(error)
  })
  bus.on("menu:runDetached", () => {
    const cur = editorStore.currentEditorValue!
    runDetached(cur.mode, cur.path!, []).catch(error)
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
