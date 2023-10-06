<script setup lang="ts">
import EditorWithTab from "../../components/EditorWithTab/EditorWithTab.vue"
import { startLanguageServerProtocolServer } from "../../lib/lsp"
import * as notify from "../../lib/notify"
import { useEditorStore } from "../../store/editor"

const editorStore = useEditorStore()

editorStore.currentEditor = "main"
try {
  editorStore.lspPort = await startLanguageServerProtocolServer()
} catch (e: any) {
  notify.error(e.toString())
}
</script>

<template>
  <EditorWithTab />
</template>
