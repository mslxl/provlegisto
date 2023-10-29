<script setup lang="ts">
import Select from "./common/Select.vue"
import { useSettingStore } from "../../store/settings"
import sync from "./sync"
const store = useSettingStore()

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
