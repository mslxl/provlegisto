<script setup lang="ts">
import { NListItem, NThing, NInputNumber } from "naive-ui"
import bus from "../../../bus/index"
type Props = {
  title: string
  secondary?: string
  suffix?: string
  globalEvent?: string
  defaultValue?: number
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onChange?: (data: number) => void
}
type Emits = (e: "update:value", value: number) => void
const emits = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
  step: 1,
  disabled: false,
})

async function updateValue(value: number): Promise<void> {
  emits("update:value", value)
  if (props.onChange !== undefined) {
    props.onChange(value)
  }
  if (props.globalEvent !== undefined) {
    await bus.emitCrossWindows(`pref:${props.globalEvent}`, value)
  }
}
</script>

<template>
  <NListItem>
    <NThing :title="props.title" :description="props.secondary" />
    <template #suffix>
      <NInputNumber
        :value="value"
        @update:value="(value) => updateValue(value!)"
        class="input"
        :update-value-on-input="false"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :disabled="disabled"
        :default-value="props.defaultValue"
      >
        <template #suffix>
          {{ props.suffix }}
        </template>
      </NInputNumber>
    </template>
  </NListItem>
</template>

<style lang="scss" scoped>
.input {
  width: 10em;
}
</style>
