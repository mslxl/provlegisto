<script setup lang="ts">
import { NListItem, NThing, NSelect } from "naive-ui"
import bus from "../../../bus/index"
import { type SelectMixedOption } from "naive-ui/es/select/src/interface"
type Props = {
  title: string
  secondary?: string
  suffix?: string
  globalEvent?: string
  defaultValue?: string
  value?: string
  disabled?: boolean
  options: SelectMixedOption[]
  onChange?: (data: string) => void
}
type Emits = (e: "update:value", value: string) => void
const emits = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
  step: 1,
  disabled: false,
})

async function updateValue(value: string): Promise<void> {
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
      <NSelect
        :value="value"
        @update:value="(value) => updateValue(value!)"
        class="input"
        :update-value-on-input="false"
        :options="props.options"
        :step="props.step"
        :disabled="disabled"
        :default-value="props.defaultValue"
      >
        <template #suffix>
          {{ props.suffix }}
        </template>
      </NSelect>
    </template>
  </NListItem>
</template>

<style lang="scss" scoped>
.input {
  width: 10em;
}
</style>
