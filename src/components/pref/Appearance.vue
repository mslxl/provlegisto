<script setup lang="ts">
import Number from "./common/Number.vue"
import Select from "./common/Select.vue"
import { useSettingStore } from "../../store/settings"
import themes from "../Editor/themeTable"
import { keys, map } from "ramda"
const store = useSettingStore()

const themeOptions = map(
  (k) => ({
    label: themes[k].name,
    value: k,
  }),
  keys(themes),
)
</script>
<template>
  <Select title="Theme" global-event="theme" :options="themeOptions" :default-value="store.theme" />
  <Number
    title="Zoom UI"
    secondary="Not available, track on tauri-apps/tauri #3310"
    global-event="zoom"
    suffix="%"
    :min="100"
    :max="200"
    :step="25"
    :default-value="store.zoom"
    :disabled="true"
  />
</template>
