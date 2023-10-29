<script setup lang="ts">
import EditorWithTab from "../../components/EditorWithTab/EditorWithTab.vue"
import { startLanguageServerProtocolServer } from "../../lib/lsp"
import * as notify from "../../lib/notify"
import { useListenPreferenceChangeHook } from "../../lib/syncPref"
import { useTabs } from "../../store/tab"
import { useSettingStore } from "../../store/settings"

const tabStore = useTabs()

tabStore.currentEditor = "main"
try {
  tabStore.lspPort = await startLanguageServerProtocolServer()
} catch (e: any) {
  notify.error(e.toString())
}

const settingsStore = useSettingStore()
useListenPreferenceChangeHook(settingsStore.$patch)
</script>

<template>
  <EditorWithTab />
</template>
../../store/tab
