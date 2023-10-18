<script setup lang="ts">
import { ref } from "vue"
import { useSettingStore } from "../../store/settings"
import bus from "../../bus"
import { reject, equals } from "ramda"
import NativeMenubar from "./Native.vue"
import Select from "../Popup/Select.vue"
import { Mode } from "../../codemirror/mode"
import { useEditorStore } from "../../store/editor"
import { WebviewWindow } from "@tauri-apps/api/window"
const settingStore = useSettingStore()

const showModeModal = ref(false)
const editorStore = useEditorStore()

bus.on("menu:changeLanguage", () => {
  showModeModal.value = true
})

bus.on("menu:preference", () => {
  const webview = new WebviewWindow("preference", {
    url: "/pref",
  })
  webview.show().catch(console.error)
})

function emitModeChange(mode: string): void {
  const id = editorStore.currentEditor!
  bus.emit(`modeChange:${id}`, (Mode as any)[mode])
}
</script>

<template>
  <NativeMenubar v-if="settingStore.menubarStyle == 'native'" />

  <Select
    v-model:show="showModeModal"
    placeholder="Language"
    :options="reject(equals('default'), Object.keys(Mode))"
    :defaultValue="editorStore.currentEditorValue?.mode"
    @commit="
      (mode: string) => {
        showModeModal = false
        emitModeChange(mode)
      }
    "
  >
  </Select>
</template>

<style lang="scss" scoped></style>
../../codemirror/mode
