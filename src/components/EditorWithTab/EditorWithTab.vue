<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import Editor from "../Editor/Editor.vue"
import HSplit from "../SplitPane/HSplitPane.vue"
import bus from "../../bus"
import * as file from "./file"
import { useEditorStore } from "../../store/editor"
import { compileFile, runDetached } from "../../lib/cp"
import TestcaseBox from "../Testcase/Testcase.vue"
import { NTabs, NTabPane } from "naive-ui"
import { Mode } from "../../codemirror/mode"
import { dialog } from "@tauri-apps/api"
import { useSettingStore } from "../../store/settings"
import * as notify from "../../lib/notify"

const editorStore = useEditorStore()
const settingsStore = useSettingStore()

const sideWith = ref(450)
bus.$on("menu:compile", () => {
  const cur = editorStore.currentEditorValue!
  bus.emit("notify:info", { title: "Start Compile" })
  compileFile(cur.mode, cur.code, []).catch((e) => {
    notify.error({
      title: "Compile Error",
      content: e,
    })
  })
})
bus.$on("emnu:runDetached", () => {
  const cur = editorStore.currentEditorValue!
  notify.info({
    title: "Start Compile",
    content: "",
  })
  runDetached(cur.mode, cur.code, settingsStore).catch((e) => {
    notify.error({
      title: "Compile Error",
      content: e,
    })
  })
})
bus.$on("menu:fileNew", addNewEditor)

onMounted(() => {
  file.listen()
})
onUnmounted(() => {
  file.unlisten()
})

function addNewEditor(): void {
  const num = editorStore.editors.size
  const id = new Date().getTime().toString()
  editorStore.create(id, Mode.cpp)
  editorStore.$patch((state) => {
    state.editors.get(id)!.name = `Unamed-${num + 1}`
  })
}
function updateCurrentEditor(targetName: string): void {
  for (const id of editorStore.ids) {
    if (editorStore.editors.get(id)?.name === targetName) {
      editorStore.currentEditor = id
      return
    }
  }
  console.error(`target name ${targetName} is not exists`)
}

async function closeEditor(targetName: string): Promise<void> {
  for (const id of editorStore.ids) {
    if (editorStore.editors.get(id)?.name === targetName) {
      const editor = editorStore.editors.get(id)!

      let closeConfirm = editor.isSaved
      if (!editor.isSaved) {
        closeConfirm = await dialog.confirm("Close the file without save")
      }

      if (closeConfirm) {
        editorStore.remove(id)
      }

      return
    }
  }
  console.error(`target name ${targetName} is not exists`)
}
</script>

<template>
  <NTabs
    type="card"
    closable
    tab-style="min-width: 80px"
    class="editor-tabs"
    addable
    @add="addNewEditor"
    @update:value="updateCurrentEditor"
    @close="closeEditor"
  >
    <NTabPane
      v-for="key of editorStore.ids"
      class="editor-tabpane"
      display-directive="show"
      :key="key"
      :name="editorStore.editors.get(key)!.name"
    >
      <HSplit :side-width="sideWith" class="editor">
        <template #main>
          <Editor :code-id="key" />
        </template>
        <template #right>
          <TestcaseBox :code-id="key" />
        </template>
      </HSplit>
    </NTabPane>
  </NTabs>
</template>

<style scoped lang="scss">
.editor-tabs {
  flex: 1;
}
.editor-tabpane {
  display: flex;
  padding: 0 !important;
  height: 100%;

  .editor {
    flex: 1;
  }
}
</style>
