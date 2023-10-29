<script setup lang="ts">
import Text from "./common/Text.vue"
import Program from "./common/Program.vue"
import { useSettingStore } from "../../store/settings"
import sync from "./sync"
const store = useSettingStore()
</script>
<template>
  <Program
    title="GNU GCC"
    v-model:program="store.cxxCompilerProgram"
    v-model:args="store.cxxCompilerArguments"
    @change="sync"
  />
  <Text title="Clangd path" v-model:value="store.clangdProgram" @change="sync" />
</template>
