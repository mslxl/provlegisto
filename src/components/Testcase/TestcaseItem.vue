<script setup lang="ts">
import { computed } from "vue"
import TextBox from "../TextBox/TextBox.vue"
import { NCard, NCollapseItem, NText, NSpace, NButton, NH6, NSpin } from "naive-ui"
type Props = {
  codeId: string
  index: number
  status: "accpeted" | "rejected" | "untested" | "testing"
  input?: string
  expect?: string
  actual?: string
  running?: boolean
}

type Emits = {
  (e: "update:input", value: string): void
  (e: "update:expect", value: string): void
  (e: "update:actual", value: string): void
  (e: "onRun"): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const barTypeDict = {
  accpeted: "success",
  rejected: "error",
  untested: "default",
  testing: "info",
}
const titleBarType = computed(() => {
  return barTypeDict[props.status]
})

function run(e: MouseEvent): void {
  emits("onRun")
  e.stopPropagation()
}
</script>
<template>
  <NSpin :show="running">
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
  </NSpin>
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
