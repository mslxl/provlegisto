<script setup lang="ts">
import Menubar from "./components/Menubar/Menubar.vue"
import EditorWithTab from "./components/EditorWithTab/EditorWithTab.vue"
import { useEditorStore } from "./store/editor"

const editorStore = useEditorStore()
editorStore.currentEditor = "main"
</script>

<template>
  <div class="container">
    <Menubar />
    <EditorWithTab />
  </div>
</template>

<style scoped></style>
