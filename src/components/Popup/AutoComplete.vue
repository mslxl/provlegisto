<script setup lang="ts">
import { NModal, NAutoComplete, type AutoCompleteInst } from "naive-ui"
import { computed, nextTick, ref, watch } from "vue"
import { compose, pair, sortBy, map, identical, prop, dropWhile, identity } from "ramda"

type Props = {
  show: boolean
  placeholder: string
  options: string[]
  filter: boolean
}
type Emits = {
  (e: "update:show", value: boolean): void
  (e: "commit", value: string): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
// emit.

const value = ref("")
const field = ref<AutoCompleteInst | null>(null)
const focusOwner = ref<HTMLDivElement | null>(null)

const filteredOptions = computed(() => {
  const drop = props.filter ? dropWhile(compose(identical(-1), prop(0))) : identity
  const sort = sortBy(prop(0))
  const recover = map(prop(1) as any)
  const cover = map((x: string) => pair(x.indexOf(value.value), x))
  return recover(drop(sort(cover(props.options)))) as unknown as string[]
})
watch(
  () => props.show,
  () => {
    if (props.show) {
      nextTick(() => {
        value.value = ""
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
      <NAutoComplete
        ref="field"
        v-model:value="value"
        spellcheck="false"
        placement="bottom"
        class="modal-auto-complete"
        size="large"
        :input-props="{
          // autocomplete: 'disabled',
          onKeydown: (event) => {
            if (event.key === 'Enter') {
              emit('commit', value)
            }
          },
        }"
        :get-show="() => true"
        :placeholder="placeholder"
        :options="filteredOptions"
        @select="(v: string) => emit('commit', v.toString())"
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
