/**
 * 监听 Bus 中菜单的点击事件
 * 触发相应事件时，响应用户操作
 */
import bus from "../../bus"
import { dialog, fs } from "@tauri-apps/api"
import { Mode, allowExtension, getExtensionByMode, getModeByExtension } from "../../codemirror/mode"
import { map, slice } from "ramda"
import { type Testcase, useEditorStore } from "../../store/editor"
import { onMounted, onUnmounted } from "vue"
import { saveSourceCode, saveTextfileFromExternalFile, saveTextfileTestcase } from "../../lib/srcStore"
import { useSettingStore } from "../../store/settings"

async function menuFileOpen(): Promise<void> {
  const editorStore = useEditorStore()
  const userFile = await dialog.open({
    multiple: false,
    directory: false,
    filters: [
      {
        name: "Code",
        extensions: map(slice(1, Infinity), allowExtension) as any as string[],
      },
    ],
  })

  if (userFile == null) return
  const file = userFile as string
  const mode = getModeByExtension(file.substring(file.lastIndexOf(".")))
  const code = await fs.readTextFile(file)

  const id = file
  editorStore.create(id, mode ?? Mode.cpp)
  // TODO: 应该打开到新 id 编辑器
  editorStore.$patch((state) => {
    const e = state.editors.get(id)!
    e.code = code
    e.isSaved = true
    e.mode = mode ?? Mode.cpp
    e.path = file
  })
  // 通知 editor 更新
  bus.emit(`sync:code`, id)
}
/**
 * 保存用户测试样例
 * 如果文件过大，或文件是由外部保存产生，不会触发保存动作
 */
async function saveMutableTestcase(sourcePath: string, testcase: Testcase[]): Promise<void> {
  const config = useSettingStore()
  for (const [idx, item] of testcase.entries()) {
    if (item.multable) {
      await saveTextfileTestcase(sourcePath, item.input, item.output, idx, config)
    } else {
      await saveTextfileFromExternalFile(sourcePath, item.inputFlie, item.outputFile, idx, config)
    }
  }
}

async function menuFileSave(): Promise<void> {
  const editorStore = useEditorStore()
  if (editorStore.currentEditorValue == null) return
  const state = editorStore.currentEditorValue
  if (state.path == null) {
    await menuFileSaveAs()
    return
  }
  await saveSourceCode(state.path, editorStore.currentEditorValue.code)
  await saveMutableTestcase(state.path, editorStore.currentEditorValue.testcase)
}
async function menuFileSaveAs(): Promise<void> {
  const editorStore = useEditorStore()
  if (editorStore.currentEditorValue == null) return
  const userFile = await dialog.save({
    filters: [
      {
        name: "Code",
        extensions: [getExtensionByMode(editorStore.currentEditorValue?.mode).substring(1)],
      },
    ],
  })
  if (userFile == null) return
  editorStore.editors.get(editorStore.currentEditor!)!.path = userFile
  await saveSourceCode(userFile, editorStore.currentEditorValue.code)
  await saveMutableTestcase(userFile, editorStore.currentEditorValue.testcase)
}

export function $mount(): void {
  onMounted(() => {
    listen()
  })
  onUnmounted(() => {
    unlisten()
  })
}

export function listen(): void {
  bus.on("menu:fileOpen", () => {
    menuFileOpen().catch(console.error)
  })
  bus.on("menu:fileSave", () => {
    menuFileSave().catch(console.error)
  })
  bus.on("menu:fileSaveAs", () => {
    menuFileSaveAs().catch(console.error)
  })
}
export function unlisten(): void {
  bus.off("menu:fileOpen")
  bus.off("menu:fileSave")
  bus.off("menu:fileSaveAs")
}
