<script setup lang="ts">
import { error, info } from "tauri-plugin-log-api"
import { runAndCheck } from "../../lib/cp"
import { useEditorStore } from "../../store/editor"
import TextBox from "../TextBox/TextBox.vue"
import { NCard, NCollapseItem, NText, NSpace, NButton, NH6 } from "naive-ui"
type Props = {
  codeId: string
  index: number
  status: "accpeted" | "rejected" | "untested" | "testing"
  input?: string
  expect?: string
  actual?: string
}

type Emits = {
  (e: "update:input", value: string): void
  (e: "update:expect", value: string): void
  (e: "update:actual", value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const barTypeDict = {
  accpeted: "success",
  rejected: "error",
  untested: "default",
  testing: "info",
}
const titleBarType = barTypeDict[props.status]

const editorStore = useEditorStore()
function run(e: MouseEvent): void {
  const state = editorStore.editors.get(props.codeId)!
  runAndCheck(state.mode, state.code, [], props.input!, props.expect!)
    .then((v) => {
      void info(v)
      emits("update:actual", v)
    })
    .catch((e) => {
      void error(e)
    })

  e.stopPropagation()
}
</script>
<template>
  <NCollapseItem :name="props.index" pla>
    <!-- <template #arrow><i style="width: 1em"></i></template> -->
    <template #header>
      <NH6 prefix="bar" align-text :type="titleBarType as any" class="header">
        <NText strong class="title"> Testcase #{{ props.index }} </NText>
      </NH6>
    </template>
    <template #header-extra>
      <NSpace class="header-extra">
        <NButton @click="run">Run</NButton>
        <NButton @click="(e) => e.stopPropagation()">More</NButton>
      </NSpace>
    </template>
    <div class="testcase-row">
      <NCard
        title="Input"
        class="testcase-item"
        size="small"
        content-style="padding: 0;"
        header-style="padding:0; text-align: center;"
      >
        <TextBox :editable="true" :content="props.input" @update:content="(v) => emits('update:input', v)" />
      </NCard>
      <NCard
        title="Expect"
        class="testcase-item"
        size="small"
        content-style="padding: 0;"
        header-style="padding:0; text-align: center;"
      >
        <TextBox :editable="true" :content="props.expect" @update:content="(v) => emits('update:expect', v)" />
      </NCard>
      <NCard
        title="Actual"
        class="testcase-item"
        size="small"
        content-style="padding: 0;"
        header-style="padding:0; text-align: center;"
      >
        <TextBox :editable="false" :content="props.actual" :control-by-content="true" />
      </NCard>
    </div>
  </NCollapseItem>
</template>

<style scoped lang="scss">
.testcase-row {
  display: flex;
  .testcase-item {
    flex: 1;
    margin: 2px;
    align-items: stretch;
    align-content: stretch;
    box-shadow: 0 0 2px #eee;
  }
}

.header-extra {
  padding-right: 12px;
}

.header {
  display: flex;
  margin: 0 0 0 1em;
}
</style>
