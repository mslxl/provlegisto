<script setup lang="ts">
import { ref } from "vue"
import { useSettingStore } from "../../store/settings"
import bus from "../../bus"
import { reject, equals } from "ramda"
import NativeMenubar from "./native.vue"
import PopupAutoComplete from "../popupAutoComplete/index.vue"
import { Mode } from "../editor/editorMode"
const settingStore = useSettingStore()

const showModeModal = ref(false)

bus.on("menu:changeLanguage", () => {
  showModeModal.value = true
})
</script>

<template>
  <NativeMenubar v-if="settingStore.menubarStyle == 'native'" />

  <PopupAutoComplete
    v-model:show="showModeModal"
    placeholder="Language"
    :options="reject(equals('default'), Object.keys(Mode))"
    @commit="(mode) => bus.emit('modeChange:main', (Mode as any)[mode])"
    :filter="true"
  >
  </PopupAutoComplete>
</template>

<style lang="scss" scoped></style>
