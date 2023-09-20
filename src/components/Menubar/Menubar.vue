<script setup lang="ts">
import { ref } from "vue"
import { useSettingStore } from "../../store/settings"
import bus from "../../bus"
import { reject, equals } from "ramda"
import NativeMenubar from "./Native.vue"
import Select from "../Popup/Select.vue"
import { Mode } from "../Editor/mode"
import { useEditorStore } from "../../store/editor"
const settingStore = useSettingStore()

const showModeModal = ref(false)
const editorStore = useEditorStore()

bus.on("menu:changeLanguage", () => {
  showModeModal.value = true
})
</script>

<template>
  <NativeMenubar v-if="settingStore.menubarStyle == 'native'" />

  <Select
    v-model:show="showModeModal"
    placeholder="Language"
    :options="reject(equals('default'), Object.keys(Mode))"
    :defaultValue="editorStore.currentEditorValue?.mode"
    @commit="
      (mode) => {
        bus.emit('modeChange:main', (Mode as any)[mode])
        showModeModal = false
      }
    "
  >
  </Select>
</template>

<style lang="scss" scoped></style>
../Editor/mode
