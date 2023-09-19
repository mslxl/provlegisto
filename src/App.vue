<script setup lang="ts">
import Editor from "./components/editor/index.vue"
import Menubar from "./components/menubar/index.vue"
import { useEditorStore } from "./store/editor"

const editorStore = useEditorStore()
editorStore.currentEditor = "main"
</script>

<template>
  <div class="container">
    <Menubar />
    <Editor code-id="main" />
  </div>
</template>

<style scoped></style>
