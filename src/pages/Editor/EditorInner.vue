<script setup lang="ts">
import EditorWithTab from "../../components/EditorWithTab/EditorWithTab.vue"
import { startLanguageServerProtocolServer } from "../../lib/lsp"
import * as notify from "../../lib/notify"
import { useListenPreferenceChangeHook } from "../../lib/syncPref"
import { useEditorStore } from "../../store/editor"
import { useSettingStore } from "../../store/settings"

const editorStore = useEditorStore()

editorStore.currentEditor = "main"
try {
  editorStore.lspPort = await startLanguageServerProtocolServer()
} catch (e: any) {
  notify.error(e.toString())
}

const settingsStore = useSettingStore()
useListenPreferenceChangeHook(settingsStore.$patch)
</script>

<template>
  <EditorWithTab />
</template>
