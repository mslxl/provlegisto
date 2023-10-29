<script setup lang="ts">
import Number from "./common/Number.vue"
import Select from "./common/Select.vue"
import Text from "./common/Text.vue"
import { useSettingStore } from "../../store/settings"
import themes from "../../codemirror/themeTable"
import { keys, map } from "ramda"
import sync from "./sync"
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
  <Select title="Theme" global-event="theme" :options="themeOptions" v-model:value="store.theme" @change="sync" />
  <Number
    title="Font Size"
    global-event="font-size"
    suffix="px"
    :min="1"
    :step="1"
    v-model:value="store.fontSize"
    @change="sync"
  />
  <Text title="Font Family" global-event="font-family" v-model:value="store.fontFamily" @change="sync" />
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
