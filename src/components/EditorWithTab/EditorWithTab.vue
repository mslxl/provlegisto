<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { dialog } from "@tauri-apps/api"
import { NTabs, NTabPane, NButton } from "naive-ui"

import Editor from "../Editor/Editor.vue"
import HSplit from "../SplitPane/HSplitPane.vue"
import EmptyTabPane from "./Empty.vue"
import TestcaseBox from "../Testcase/Testcase.vue"
import bus from "../../bus"
import { useEditorStore } from "../../store/editor"
import { compileFile, runDetached } from "../../lib/cp"
import { Mode } from "../../codemirror/mode"
import { useSettingStore } from "../../store/settings"
import * as file from "./file"
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
  const id = `Unamed-${num + 1}`
  editorStore.create(id, Mode.cpp)
  if (num === 0) {
    editorStore.$patch((state) => {
      state.currentEditor = id
    })
  }
}

async function closeEditor(targetName: string): Promise<void> {
  const editor = editorStore.editors.get(targetName)!

  let closeConfirm = editor.isSaved
  if (!editor.isSaved) {
    closeConfirm = await dialog.confirm("Close the file without save")
  }

  if (closeConfirm) {
    editorStore.remove(targetName)
  }
}
</script>

<template>
  <EmptyTabPane :empty="editorStore.editors.size == 0">
    <template #content>
      <NTabs
        type="card"
        closable
        tab-style="min-width: 80px"
        class="editor-tabs"
        addable
        :value="editorStore.currentEditor ?? undefined"
        @update:value="(v) => (editorStore.currentEditor = v)"
        @add="addNewEditor"
        @close="closeEditor"
      >
        <NTabPane v-for="key of editorStore.ids" class="editor-tabpane" display-directive="show" :key="key" :name="key">
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
    <template #extra>
      <NButton size="small" @click="addNewEditor"> 新建文件 </NButton>
    </template>
  </EmptyTabPane>
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
