<script setup lang="ts">
import { NEmpty } from "naive-ui"
type Props = {
  empty: boolean
}
const props = defineProps<Props>()
</script>

<template>
  <NEmpty v-if="props.empty" size="large" description="英仙座 写点什么吧" class="empty-panel">
    <template #extra>
      <slot name="extra" />
    </template>
  </NEmpty>
  <slot v-else name="content" />
</template>

<style scoped lang="scss">
.empty-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
