<script setup lang="ts">
import Menubar from "./components/Menubar/Menubar.vue"
import EditorWithTab from "./components/EditorWithTab/EditorWithTab.vue"
import { useEditorStore } from "./store/editor"
import { startLocalLSP, stopLSP } from "./lsp/local"
import { onMounted, onUnmounted } from "vue"

const editorStore = useEditorStore()
editorStore.currentEditor = "main"
onMounted(() => {
  startLocalLSP().then(console.log).catch(console.error)
})
onUnmounted(() => {
  stopLSP().then(console.log).catch(console.error)
})
</script>

<template>
  <div class="container">
    <Menubar />
    <EditorWithTab />
  </div>
</template>

<style scoped></style>
