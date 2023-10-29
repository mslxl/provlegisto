<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { dialog } from "@tauri-apps/api"
import { NTabs, NTabPane, NButton, NButtonGroup } from "naive-ui"

import Editor from "../Editor/Editor.vue"
import HSplit from "../SplitPane/HSplitPane.vue"
import EmptyTabPane from "./Empty.vue"
import TestcaseBox from "../Testcase/Testcase.vue"
import bus from "../../bus"
import { useSettingStore } from "../../store/settings"
import { compileFile, runDetached } from "../../lib/cp"
import { Mode } from "../../codemirror/mode"
import { useTabs } from "../../store/tab"
import * as file from "./file"
import * as notify from "../../lib/notify"

const tabsStore = useTabs()
const settingsStore = useSettingStore()

const sideWith = ref(450)
bus.$on("menu:compile", () => {
  const cur = tabsStore.currentEditorValue!
  bus.emit("notify:info", { title: "Start Compile" })
  compileFile(cur.mode, cur.code, settingsStore.$state).catch((e) => {
    notify.error({
      title: "Compile Error",
      content: e.toString(),
    })
  })
})
bus.$on("menu:runDetached", () => {
  const cur = tabsStore.currentEditorValue!
  notify.info({
    title: "Start Compile",
    content: "",
  })
  runDetached(cur.mode, cur.code, settingsStore.$state).catch((e) => {
    notify.error({
      title: "Compile Error",
      content: e.toString(),
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
  const num = tabsStore.editors.size
  const id = `Unamed-${num + 1}`
  tabsStore.create(id, Mode.cpp)
  if (num === 0) {
    tabsStore.$patch((state) => {
      state.currentEditor = id
    })
  }
}

async function closeEditor(targetName: string): Promise<void> {
  const editor = tabsStore.editors.get(targetName)!

  let closeConfirm = editor.isSaved
  if (!editor.isSaved) {
    closeConfirm = await dialog.confirm("Close the file without save")
  }

  if (closeConfirm) {
    tabsStore.remove(targetName)
  }
}
</script>

<template>
  <EmptyTabPane :empty="tabsStore.editors.size == 0">
    <template #content>
      <NTabs
        type="card"
        closable
        tab-style="min-width: 80px"
        class="editor-tabs"
        addable
        :value="tabsStore.currentEditor ?? undefined"
        @update:value="(v) => (tabsStore.currentEditor = v)"
        @add="addNewEditor"
        @close="closeEditor"
      >
        <NTabPane v-for="key of tabsStore.ids" class="editor-tabpane" display-directive="show" :key="key" :name="key">
          <HSplit v-model:side-width="sideWith" class="editor">
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
      <NButtonGroup>
        <NButton size="small" @click="addNewEditor"> 创建新文件 </NButton>
        <!-- <NButton size="small"> 组团开黑 </NButton> -->
      </NButtonGroup>
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
../../store/tab
