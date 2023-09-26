<script setup lang="ts">
import { onUnmounted, ref } from "vue"

type Props = {
  sideWidth: number
}
type Emits = (e: "update:sideWidth", value: number) => void
const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const splitPaneRef = ref<HTMLDivElement>()
let startX = 0
let startWidth = 0
function startDrag(e: MouseEvent): void {
  startX = e.clientX
  startWidth = props.sideWidth
  document.documentElement.addEventListener("mousemove", onDrag)
  document.documentElement.addEventListener("mouseup", stopDrag)
}
function stopDrag(): void {
  document.documentElement.removeEventListener("mousemove", onDrag)
  document.documentElement.removeEventListener("mouseup", stopDrag)
}
function onDrag(e: MouseEvent): void {
  const newWidth = startWidth - (e.clientX - startX)
  // console.log(newWidth)
  emits("update:sideWidth", newWidth)
}

onUnmounted(() => {
  stopDrag()
})
</script>
<template>
  <div class="split" ref="splitPaneRef">
    <div class="main">
      <slot name="main"></slot>
      <div class="separator" @mousedown="startDrag">
        <i></i>
        <i></i>
      </div>
    </div>

    <div class="scalable" :style="{ width: props.sideWidth + 'px' }">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.split {
  display: flex;
  margin: 0;
}
.main {
  position: relative;
  flex: 1;
}

.separator {
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
  cursor: col-resize;

  i {
    display: inline-block;
    height: 14px;
    width: 1px;
    background-color: #e9e9e9;
    margin: 0 1px;
  }
}
</style>
