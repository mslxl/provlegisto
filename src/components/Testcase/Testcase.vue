<script setup lang="ts">
import { ref } from "vue"
import { useEditorStore } from "../../store/editor"
import TestcaseItem from "./TestcaseItem.vue"
import { NButton, NButtonGroup, NCollapse, NProgress } from "naive-ui"

type Props = {
  codeId: string
}

const props = defineProps<Props>()
const editorStore = useEditorStore()
const state = editorStore.editors.get(props.codeId)!

const task = ref({
  total: state.testcase.length,
  complete: 0,
  state: "untested",
})

const tempOutput = ref("")
</script>
<template>
  <div class="testcase-wrapper">
    <div class="testcase-box">
      <NProgress
        type="line"
        :border-radius="0"
        :fill-border-radius="0"
        :percentage="Math.ceil(task.complete / task.total)"
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
          :input="testcase.input"
          :expect="testcase.output"
          v-model:actual="tempOutput"
          status="untested"
          @update:input="
            (v) =>
              editorStore.updateTestcase(props.codeId, index, (origin) => {
                origin.input = v
              })
          "
          @update:expect="
            (v) =>
              editorStore.updateTestcase(props.codeId, index, (origin) => {
                origin.output = v
              })
          "
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
