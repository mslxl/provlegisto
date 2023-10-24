<script setup lang="ts">
import { useDocumentTitle } from "../lib/window"
import { type MenuOption, NLayout, NLayoutContent, NLayoutSider, NList } from "naive-ui"
import { NMenu } from "naive-ui"
import { ref } from "vue"

import PrefAppearance from "../components/pref/Appearance.vue"
import PrefExecuate from "../components/pref/Execuate.vue"
import PrefKeymap from "../components/pref/Keymap.vue"

useDocumentTitle("Preference")

const activeMenu = ref<string>("appearance")
const menuOption: MenuOption[] = [
  {
    label: "Appearance",
    key: "appearance",
  },
  {
    label: "Editor",
    key: "editor",
    children: [
      {
        label: "Keymap",
        key: "editor.keymap",
      },
      {
        label: "Execuate",
        key: "editor.exec",
      },
    ],
  },
  {
    label: "Language",
    disabled: false,
    key: "language",
    children: [
      {
        label: "C/C++",
        key: "language.cxx",
      },
    ],
  },
]
</script>
<template>
  <NLayout has-sider class="container">
    <NLayoutSider bordered>
      <NMenu :options="menuOption" v-model:value="activeMenu" />
    </NLayoutSider>
    <NLayoutContent content-style="padding: 24px;">
      <NList>
        <PrefAppearance v-if="activeMenu == 'appearance'" />
        <PrefExecuate v-else-if="activeMenu == 'editor.exec'" />
        <PrefKeymap v-else-if="activeMenu == 'editor.keymap'" />
      </NList>
    </NLayoutContent>
  </NLayout>
</template>
<style scoped>
.container {
  flex: 1;
  flex-basis: 100vh;
}
</style>
