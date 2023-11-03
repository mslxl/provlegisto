<script setup lang="ts">
import { basicSetup } from "codemirror"
import { onMounted, onUnmounted, ref, watch } from "vue"
import { EditorView, type ViewUpdate } from "@codemirror/view"
import { Compartment } from "@codemirror/state"
import { setTheme } from "../../components/codemirror/theme"
import themes from "../../components/codemirror/themeTable"
import { useSettingStore } from "../../store/settings"
import bus from "../../lib/bus"

type Props = {
  content?: string
  controlByContent?: boolean
  editable: boolean
}
type Emits = (e: "update:content", value: string) => void
const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const textBoxRef = ref<HTMLDivElement>()

const settingsStore = useSettingStore()

let codemirror: EditorView

if (props.controlByContent) {
  watch(props, () => {
    if (props.content === codemirror?.state?.doc?.toString()) return
    codemirror.dispatch({
      changes: [
        {
          from: 0,
          to: codemirror.state.doc.length,
          insert: props.content,
        },
      ],
    })
  })
}

const themeCompartment = new Compartment()
function updateTheme(): void {
  setTheme((themes as any)[settingsStore.theme], codemirror, themeCompartment).catch(console.error)
}

bus.$on("pref:theme", updateTheme)

onMounted(() => {
  codemirror = new EditorView({
    doc: props.content,
    extensions: [
      basicSetup,
      EditorView.editable.of(props.editable),
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (!v.docChanged) return
        const content = v.state.doc.toString()
        if (content === props.content) return
        emits("update:content", content)
      }),
      themeCompartment.of([]),
      EditorView.theme({
        "&": {
          height: "100%",
          width: "100%",
        },
        "&.cm-editor": {
          outline: "none",
        },
      }),
    ],
    parent: textBoxRef.value!,
  })

  updateTheme()
})

onUnmounted(() => {
  codemirror?.destroy()
})
</script>
<template>
  <div class="textbox-wrapper">
    <div class="textbox" ref="textBoxRef"></div>
  </div>
</template>

<style scoped lang="scss">
.textbox-wrapper {
  display: flex;
  height: 100%;
}

.textbox {
  flex: 1;
}
</style>
../codemirror/theme../codemirror/themeTable ../../lib/bus
