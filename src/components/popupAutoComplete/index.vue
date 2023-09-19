<script setup lang="ts">
import { NModal, NAutoComplete } from "naive-ui"
import { computed, ref } from "vue"
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
const { show, placeholder, options, filter } = defineProps<Props>()

const emit = defineEmits<Emits>()
// emit.

const value = ref("")

const filteredOptions = computed(() => {
  const drop = filter ? dropWhile(compose(identical(-1), prop(0))) : identity
  const sort = sortBy(prop(0))
  const recover = map(prop(1))
  const cover = map((x: string) => pair(x.indexOf(value.value), x))
  return recover(drop(sort(cover(options)))) as unknown as string[]
})
</script>

<template>
  <NModal :show="show" @update:show="(v) => emit('update:show', v)" transform-origin="center">
    <NAutoComplete
      v-model:value="value"
      spellcheck="false"
      placement="bottom"
      class="modal-auto-complete"
      size="large"
      :input-props="{
        autocomplete: 'disabled',
      }"
      :get-show="() => true"
      :placeholder="placeholder"
      :options="filteredOptions"
      @select="emit('commit', value)"
    >
    </NAutoComplete>
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
