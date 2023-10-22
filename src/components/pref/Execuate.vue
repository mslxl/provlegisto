<script setup lang="ts">
import Program from "./common/Program.vue"
import { useSettingStore } from "../../store/settings"
const store = useSettingStore()
</script>
<template>
  <Program
    title="Run detached terminal"
    v-model:program="store.terminalProgram"
    v-model:args="store.terminalArguments"
  />
</template>
