<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import Editor from "../Editor/Editor.vue"
import * as file from "./file"

onMounted(() => {
  file.listen()
})
onUnmounted(() => {
  file.unlisten()
})
</script>

<template>
  <Editor code-id="main" />
</template>
