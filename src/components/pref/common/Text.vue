<script setup lang="ts">
import { NListItem, NThing, NInput } from "naive-ui"
import bus from "../../../bus/index"
type Props = {
  title: string
  secondary?: string
  suffix?: string
  globalEvent?: string
  defaultValue?: string
  value?: string
  disabled?: boolean
}
type Emits = (e: "update:value", value: string) => void
const emits = defineEmits<Emits>()
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

async function updateValue(value: string): Promise<void> {
  emits("update:value", value)
  if (props.globalEvent !== undefined) {
    await bus.emitCrossWindows(`pref:${props.globalEvent}`, value)
  }
}
</script>

<template>
  <NListItem>
    <NThing :title="props.title" :description="props.secondary" />
    <template #suffix>
      <NInput
        :value="value"
        @update:value="(value) => updateValue(value!)"
        class="input"
        :update-value-on-input="false"
        :disabled="disabled"
        :default-value="props.defaultValue"
      >
        <template #suffix>
          {{ props.suffix }}
        </template>
      </NInput>
    </template>
  </NListItem>
</template>

<style lang="scss" scoped>
.input {
  width: 10em;
}
</style>
