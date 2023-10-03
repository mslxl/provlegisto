<script setup lang="ts">
import { ref, watch } from "vue"
import { useEditorStore } from "../../store/editor"
import TestcaseItem from "./TestcaseItem.vue"
import { NButton, NButtonGroup, NCollapse, NProgress } from "naive-ui"
import { runCode } from "../../lib/cp"
import { saveToTempfile } from "../../lib/tempfile"
import { error } from "tauri-plugin-log-api"
import { fs } from "@tauri-apps/api"

type Props = {
  codeId: string
}

const props = defineProps<Props>()
const editorStore = useEditorStore()
const state = editorStore.editors.get(props.codeId)!

interface Testdata {
  output: string
  status: "accpeted" | "rejected" | "untested" | "testing"
}

const taskAbbr = ref({
  total: state.testcase.length,
  complete: 0,
  status: "untested",
})
const tasks = ref<Testdata[]>([])
watch(editorStore, () => {
  while (tasks.value.length < state.testcase.length) {
    tasks.value.push({ output: "", status: "untested" })
  }
})

async function runTest(testcaseIndex: number): Promise<void> {
  tasks.value[testcaseIndex].status = "testing"
  tasks.value[testcaseIndex].output = ""
  const inputFile = await saveToTempfile(state.testcase[testcaseIndex].input, "in")
  try {
    const outputFile = await runCode(state.mode, state.code, [], inputFile, 3000)
    const ouf = await fs.readTextFile(outputFile)
    tasks.value[testcaseIndex].output = ouf
    tasks.value[testcaseIndex].status = "accpeted"
  } catch (e: any) {
    void error(e.toString())
    tasks.value[testcaseIndex].status = "rejected"
  }
}
</script>
<template>
  <div class="testcase-wrapper">
    <div class="testcase-box">
      <NProgress
        type="line"
        :border-radius="0"
        :fill-border-radius="0"
        :percentage="Math.ceil(taskAbbr.complete / taskAbbr.total)"
        :show-indicator="false"
      />
      <NButtonGroup class="button-group">
        <NButton @click="editorStore.addTestcase(props.codeId)"> Add </NButton>
      </NButtonGroup>
      <NCollapse arrow-placement="right">
        <TestcaseItem
          v-for="(testcase, index) of state.testcase"
          :code-id="props.codeId"
          :key="index"
          :index="index"
          :status="tasks[index].status"
          :running="tasks[index].status == 'testing'"
          v-model:input="testcase.input"
          v-model:expect="testcase.output"
          v-model:actual="tasks[index].output"
          @on-run="runTest(index)"
        />
      </NCollapse>
    </div>
  </div>
</template>
<style scoped lang="scss">
.button-group {
  margin: 12px;
}
.testcase-overview {
  display: grid;
  padding: 12px;
  gap: 2px;
  grid-template-columns: repeat(auto-fit, minmax(2em, 2em));
  .overview-item {
    width: 2em;
    height: 2em;
  }
}

.testcase-wrapper {
  position: relative;
  height: 100%;
  .testcase-box {
    left: 0;
    right: 0;
    height: 100%;
    position: absolute;

    overflow-y: auto;
  }
}
</style>
