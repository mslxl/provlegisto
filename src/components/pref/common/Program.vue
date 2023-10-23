<script setup lang="ts">
import { NListItem, NThing, NDynamicInput, NButton, NInput, NSpace } from "naive-ui"
import bus from "../../../bus/index"
type Props = {
  title: string
  secondary?: string
  suffix?: string
  globalEvent?: string
  program?: string
  args?: string[]
  disabled?: boolean
  onChange?: (program: string, args: string[]) => void
}
type Emits = {
  (e: "update:program", value: string): void
  (e: "update:args", value: string[]): void
}
const emits = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})
async function updateArgs(value: any): Promise<void> {
  const args = value as string[]
  emits("update:args", args)
  if (props.onChange !== undefined) {
    props.onChange(props.program ?? "", value)
  }
  if (props.globalEvent !== undefined) {
    await bus.emitCrossWindows(`pref:${props.globalEvent}`, value)
  }
}
async function updateProgram(value: string): Promise<void> {
  emits("update:program", value)
  if (props.onChange !== undefined) {
    props.onChange(value, props.args ?? [])
  }
  if (props.globalEvent !== undefined) {
    await bus.emitCrossWindows(`pref:${props.globalEvent}`, value)
  }
}
</script>

<template>
  <NListItem>
    <NThing :title="props.title" :description="props.secondary">
      <NSpace vertical>
        <NInput placeholder="Program name" :value="$props.program" @update:value="updateProgram"> </NInput>
        <NDynamicInput :value="props.args" @update:value="updateArgs" placeholder="Input program argument">
          <template #create-button-default>
            <NButton> Create Argument </NButton>
          </template>
        </NDynamicInput>
      </NSpace>
    </NThing>
  </NListItem>
</template>

<style lang="scss" scoped>
.input {
  width: 10em;
}
</style>
