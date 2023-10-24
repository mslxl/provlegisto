<script setup lang="ts">
import Select from "./common/Select.vue"
import { useSettingStore } from "../../store/settings"
import { syncPreferenceCrossWindows } from "../../lib/syncPref"
const store = useSettingStore()
function sync(): void {
  syncPreferenceCrossWindows(store).catch(console.error)
}

const cursorKeymapOptions = [
  {
    label: "None",
    value: "none",
  },
  {
    label: "Vim",
    value: "vim",
  },
  {
    label: "Emacs",
    value: "emacs",
  },
]
</script>
<template>
  <Select
    title="Basic Keymap"
    :options="cursorKeymapOptions"
    global-event="cursor-keymap"
    v-model:value="store.cursorKeymap"
    @change="sync"
  />
</template>
