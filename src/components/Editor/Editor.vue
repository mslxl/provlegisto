<script setup lang="ts">
import { basicSetup } from "codemirror"
import { EditorView, keymap, lineNumbers, type ViewUpdate } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { Compartment } from "@codemirror/state"
import { onMounted, onUnmounted, ref } from "vue"
import bus from "../../bus"
import { Mode, setMode } from "../../codemirror/mode"
import { setTheme } from "../../codemirror/theme"
import { setCursorKeymap } from "../../codemirror/keymap"
import { useSettingStore } from "../../store/settings"
import themes from "../../codemirror/themeTable"
import { useTabs } from "../../store/tab"
import { filterCSSQuote } from "../../lib/style"

type Props = {
  codeId: string
}

const props = defineProps<Props>()
const block = ref<Element | null>(null)
const tabStore = useTabs()
const settingsStore = useSettingStore()

const languageCompartment = new Compartment()
const languageServerCompartment = new Compartment()
const themeCompartment = new Compartment()
const fontSizeCompartment = new Compartment()
const lineNumCompartment = new Compartment()
const cursorKeymapCompartment = new Compartment()

let codemirror: EditorView

function updateFont(): void {
  const style: any = {
    fontSize: `${settingsStore.fontSize}pt`,
  }
  if (settingsStore.fontFamily.trim().length !== 0) {
    style.fontFamily = filterCSSQuote(settingsStore.fontFamily.trim())
  }

  codemirror.dispatch({
    effects: fontSizeCompartment.reconfigure(
      EditorView.theme({
        ".cm-scroller": style,
      }),
    ),
  })
}

tabStore.createIfNotExists(props.codeId, Mode.cpp)

// 编辑器主题设置更新
// 由于该事件可能来自其他窗口，因此不能从设置项中直接读取
bus.$on("pref:theme", () => {
  void setTheme((themes as any)[settingsStore.theme], codemirror, themeCompartment)
})

bus.$on("pref:font-size", updateFont)
bus.$on("pref:font-family", updateFont)
bus.$on("pref:cursor-keymap", () => {
  console.log(settingsStore.cursorKeymap)
  setCursorKeymap(settingsStore.cursorKeymap, codemirror, cursorKeymapCompartment)
})

// 文件因外部修改更新
bus.$on(`sync:code`, (id: string) => {
  if (id !== props.codeId) return
  const state = tabStore.editors.get(props.codeId)!
  // 设置语言
  setMode(state.mode, codemirror, props.codeId, languageCompartment, languageServerCompartment).catch(console.error)
  // 替换编辑器中所有内容
  codemirror.dispatch({
    changes: [
      {
        from: 0,
        to: codemirror.state.doc.length,
        insert: state.code,
      },
    ],
  })
})

// 语言更新
bus.$on(`modeChange:${props.codeId}`, (e) => {
  console.log(e)
  tabStore.$patch((state) => {
    state.editors.get(props.codeId)!.mode = e as Mode
  })
  setMode(
    tabStore.currentEditorValue!.mode,
    codemirror,
    props.codeId,
    languageCompartment,
    languageServerCompartment,
  ).catch(console.error)
})

onMounted(() => {
  codemirror = new EditorView({
    extensions: [
      basicSetup,
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (!v.docChanged) return
        tabStore.$patch((state) => {
          const editorState = state.editors.get(props.codeId)!
          editorState.code = codemirror.state.doc.toString()
          editorState.isSaved = false
        })
      }),
      keymap.of([indentWithTab]),
      languageCompartment.of([]),
      languageServerCompartment.of([]),
      themeCompartment.of([]),
      fontSizeCompartment.of(EditorView.theme({})),
      lineNumCompartment.of(lineNumbers()),
      cursorKeymapCompartment.of([]),
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
    doc: tabStore.editors.get(props.codeId)?.code ?? "",
    parent: block.value!,
  })

  setTheme((themes as any)[settingsStore.theme], codemirror, themeCompartment).catch(console.error)
  updateFont()
  setCursorKeymap(settingsStore.cursorKeymap, codemirror, cursorKeymapCompartment)

  if (tabStore.editors.get(props.codeId)!.mode != null) {
    setMode(
      tabStore.editors.get(props.codeId)!.mode,
      codemirror,
      props.codeId,
      languageCompartment,
      languageServerCompartment,
    ).catch(console.error)
  }
})

onUnmounted(() => {
  codemirror.destroy()
})
</script>
<template>
  <div class="codeblock-wrapper">
    <div ref="block" :class="`codeblock codeblock-${props.codeId}`"></div>
  </div>
</template>
<style lang="scss" scoped>
.codeblock-wrapper {
  position: absolute;
  left: 0;
  width: calc(100% - 4px);
  height: 100%;
  overflow-y: auto;
}

.codeblock {
  position: relative;
  height: 100%;
}
</style>
../../store/tab
