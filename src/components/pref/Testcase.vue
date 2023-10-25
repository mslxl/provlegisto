<script setup lang="ts">
// import Select from "./common/Select.vue"
import Text from "./common/Text.vue"
import { useSettingStore } from "../../store/settings"
import { syncPreferenceCrossWindows } from "../../lib/syncPref"
const store = useSettingStore()
function sync(): void {
  syncPreferenceCrossWindows(store).catch(console.error)
}

// const testcaseStorageOptions = [
//   {
//     label: "Textfile",
//     value: "text",
//   },
//   {
//     label: "SQLite Database",
//     value: "db",
//   },
//   {
//     label: "None",
//     value: "none",
//   },
// ]
</script>
<template>
  <!-- <Select
    title="Testcase Storage Method"
    :options="testcaseStorageOptions"
    global-event="testcase-storage-method"
    v-model:value="store.testcaseStorageMethod"
    @change="sync" /> -->
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
  <!-- <Text
    title="Database Format"
    secondary="Use {name} to insert filename, and {index} for testcase index"
    :disabled="store.testcaseStorageMethod !== 'db'"
    v-model:value="store.testcaseDatabaseFormat"
    @change="sync"
  /> -->
</template>
