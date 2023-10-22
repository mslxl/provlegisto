<script setup lang="ts">
import { ref, watch } from "vue"
import { useEditorStore } from "../../store/editor"
import TestcaseItem from "./TestcaseItem.vue"
import { NButton, NButtonGroup, NCollapse, NProgress } from "naive-ui"
import { CheckStatus, ExecuatorStatus, runChecker, runCode } from "../../lib/cp"
import { saveToTempfile } from "../../lib/tempfile"
import { fs } from "@tauri-apps/api"
import { all, identity, map, range } from "ramda"
import * as notify from "../../lib/notify"
import CheckerSelect from "./CheckerSelect.vue"

type Props = {
  codeId: string
}

const props = defineProps<Props>()
const editorStore = useEditorStore()
const state = editorStore.editors.get(props.codeId)!

interface Testdata {
  output: string
  status: "accpeted" | "rejected" | "untested" | "testing"
  label?: string
}

const checker = ref("res:wcmp")

const taskCompletedCount = ref(0)
const taskSucceed = ref(true)
const tasks = ref<Testdata[]>([])
watch(editorStore, () => {
  while (tasks.value.length < state.testcase.length) {
    tasks.value.push({ output: "", status: "untested" })
  }
})

const running = ref(false)
async function runAll(): Promise<void> {
  running.value = true
  taskCompletedCount.value = 0
  const promises = map(
    async (idx) => {
      const ans = await runTest(idx)
      taskCompletedCount.value = taskCompletedCount.value + 1
      return ans
    },
    range(0, tasks.value.length),
  )
  try {
    taskSucceed.value = all(identity, await Promise.all(promises))
  } finally {
    taskSucceed.value = false
    running.value = false
  }
}

async function runTest(testcaseIndex: number): Promise<boolean> {
  tasks.value[testcaseIndex].label = "Running"
  tasks.value[testcaseIndex].status = "testing"
  tasks.value[testcaseIndex].output = ""
  const inputFile = await saveToTempfile(state.testcase[testcaseIndex].input, "in")
  const answerFile = await saveToTempfile(state.testcase[testcaseIndex].output, "ans")
  try {
    const runCodeRes = await runCode(state.mode, state.code, [], inputFile, 3000)
    if (runCodeRes.status === ExecuatorStatus.PASS) {
      const outputFile = runCodeRes.output!
      const checkerMessage = await runChecker(checker.value, inputFile, outputFile, answerFile)
      const ouf = await fs.readTextFile(outputFile)
      tasks.value[testcaseIndex].output = ouf
      tasks.value[testcaseIndex].status = checkerMessage.status === CheckStatus.AC ? "accpeted" : "rejected"
      tasks.value[testcaseIndex].label = checkerMessage.status
      return true
    } else {
      tasks.value[testcaseIndex].status = "rejected"
      tasks.value[testcaseIndex].label = runCodeRes.status
      return false
    }
  } catch (e: any) {
    // runCode error
    // maybe is UKE or RE
    console.error(e.toString())
    notify.error({ title: "Error", content: e.toString() })
    tasks.value[testcaseIndex].status = "rejected"
    tasks.value[testcaseIndex].label = "UKE"
    return false
  }
}
</script>
<template>
  <div class="testcase-wrapper">
    <div class="testcase-box">
      <NProgress
        type="line"
        :processing="running"
        :border-radius="0"
        :fill-border-radius="0"
        :percentage="Math.ceil((taskCompletedCount / state.testcase.length) * 100)"
        :show-indicator="false"
      />
      <CheckerSelect v-model:value="checker" />
      <NButtonGroup class="button-group">
        <NButton type="primary" @click="editorStore.addTestcase(props.codeId)"> Add </NButton>
        <NButton type="primary" :disabled="running" @click="runAll"> Run All </NButton>
      </NButtonGroup>
      <NCollapse arrow-placement="right">
        <TestcaseItem
          v-for="(testcase, index) of state.testcase"
          :code-id="props.codeId"
          :key="index"
          :index="index"
          :status="tasks[index].status"
          :running="tasks[index].status == 'testing'"
          :label="tasks[index].label"
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
