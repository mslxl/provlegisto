<script setup lang="ts">
import EditorWithTab from "../../components/EditorWithTab/EditorWithTab.vue"
import { startLanguageServerProtocolServer } from "../../lib/lsp"
import * as notify from "../../lib/notify"
import { useEditorStore } from "../../store/editor"
import bus from "../../bus"
import { useSettingStore } from "../../store/settings"

const editorStore = useEditorStore()
const settingStore = useSettingStore()

bus.$on("pref:theme", (theme) => {
  settingStore.theme = theme
})

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
