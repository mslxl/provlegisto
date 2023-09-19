<script setup lang="ts">
import { NModal, NSelect, type SelectInst } from "naive-ui"
import { computed, nextTick, ref, watch } from "vue"
import { toUpper, map } from "ramda"

type Props = {
  show: boolean
  placeholder: string
  defaultValue?: string
  options: string[]
}
type Emits = {
  (e: "update:show", value: boolean): void
  (e: "commit", value: string): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
// emit.

const value = ref("")
const field = ref<SelectInst | null>(null)
const focusOwner = ref<HTMLDivElement | null>(null)
const opt = computed(() => map((v) => ({ label: toUpper(v), value: v }), props.options))

watch(
  () => props.show,
  () => {
    if (props.show) {
      nextTick(() => {
        value.value = props.defaultValue ?? ""
        field.value?.blur()
        focusOwner.value?.focus()
        setTimeout(() => {
          field.value?.focus()
        }, 350)
      }).catch(console.error)
    }
  },
)
</script>

<template>
  <NModal :show="props.show" @update:show="(v) => emit('update:show', v)" transform-origin="center">
    <div>
      <div ref="focusOwner" tabindex="-1"></div>
      <NSelect
        ref="field"
        class="modal-auto-complete"
        filterable
        show-on-focus
        v-model:value="value"
        :options="opt"
        :placeholder="props.placeholder"
        @update:value="(v: string) => emit('commit', v)"
      />
    </div>
  </NModal>
</template>

<style scoped lang="scss">
.modal-auto-complete {
  max-width: 500px;
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
