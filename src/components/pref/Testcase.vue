<script setup lang="ts">
import Text from "./common/Text.vue"
import { useSettingStore } from "../../store/settings"
import { syncPreferenceCrossWindows } from "../../lib/syncPref"
const store = useSettingStore()
function sync(): void {
  syncPreferenceCrossWindows(store).catch(console.error)
}
</script>
<template>
  <Text
    title="Input Textfile Format"
    secondary="Use {name} to insert filename, and {index} for testcase index"
    :disabled="store.testcaseStorageMethod !== 'text'"
    v-model:value="store.testcaseInputFormat"
    @change="sync"
  />
  <Text
    title="Output Textfile Format"
    secondary="Use {name} to insert filename, and {index} for testcase index"
    :disabled="store.testcaseStorageMethod !== 'text'"
    v-model:value="store.testcaseOutputFormat"
    @change="sync"
  />
</template>
