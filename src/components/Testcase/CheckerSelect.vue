<script setup lang="ts">
import { ref } from "vue"
import { NSelect, NText } from "naive-ui"
import { dialog } from "@tauri-apps/api"
import { insert } from "ramda"

type Props = {
  value?: string
}
type Emits = (e: "update:value", value: string) => void
const props = withDefaults(defineProps<Props>(), {
  value: "res:wcmp",
})
const emits = defineEmits<Emits>()

const options = ref([
  {
    label: "Compare sequences of tokens",
    value: "res:wcmp",
  },
  {
    label: "YES or NO (case insensetive)",
    value: "res:yesno",
  },
  {
    label: "Compare ordered sequences of signed long long numbers",
    value: "res:ncmp",
  },
  {
    label: "Compare two doubles, maximal absolute error = 1.5E-6",
    value: "res:rcmp",
  },
  {
    label: "Compare two doubles, maximal absolute error = 1E-4",
    value: "res:rcmp4",
  },
  {
    label: "Compare two doubles, maximal absolute error = 1E-6",
    value: "res:rcmp6",
  },
  {
    label: "Compare two doubles, maximal absolute error = 1E-9",
    value: "res:rcmp9",
  },
  {
    label: "Custom checker",
    value: "custom",
  },
])

function onSelectChange(value: string): void {
  if (value === "custom") {
    selectCustomChecker().catch(console.error)
    return
  }

  emits("update:value", value)
}

async function selectCustomChecker(): Promise<void> {
  const file = (await dialog.open({
    // filters: {
    //   name: "Execuator",
    //   extensions: [],
    // },
    multiple: false,
    directory: false,
  })) as string | null
  if (file !== null) {
    options.value = insert(
      options.value.length - 1,
      {
        label: file,
        value: file,
      },
      options.value,
    )
    emits("update:value", file)
  }
}
</script>
<template>
  <div class="panel">
    <NText class="label">Checker:</NText>
    <NSelect :options="options" :value="props.value" @update:value="(v) => onSelectChange(v)" />
  </div>
</template>
<style scoped lang="scss">
.panel {
  display: flex;
  align-items: center;
  padding: 12px;
  .label {
    margin-right: 1em;
  }
}
</style>
