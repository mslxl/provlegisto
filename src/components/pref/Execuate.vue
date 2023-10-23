<script setup lang="ts">
import Program from "./common/Program.vue"
import { useSettingStore } from "../../store/settings"
import { syncPreferenceCrossWindows } from "../../lib/syncPref"
const store = useSettingStore()
function sync(): void {
  syncPreferenceCrossWindows(store).catch(console.error)
}
</script>
<template>
  <Program
    title="Run detached terminal"
    v-model:program="store.terminalProgram"
    v-model:args="store.terminalArguments"
    @change="sync"
  />
</template>
