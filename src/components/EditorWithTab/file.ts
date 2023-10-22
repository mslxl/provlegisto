import bus from "../../bus"
import { dialog, fs } from "@tauri-apps/api"
import { Mode, allowExtension, getExtensionByMode, getModeByExtension } from "../../codemirror/mode"
import { map, slice } from "ramda"
import { useEditorStore } from "../../store/editor"

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
  const id = "main"
  // TODO: 应该打开到新 id 编辑器
  editorStore.$patch((state) => {
    const e = state.editors.get("main")!
    e.code = code
    e.isSaved = true
    e.mode = mode ?? Mode.cpp
    e.path = file
  })
  // 通知 editor 更新
  bus.emit(`externalChange:${id}`)
}
async function menuFileSave(): Promise<void> {
  const editorStore = useEditorStore()
  if (editorStore.currentEditorValue == null) return
  const state = editorStore.currentEditorValue
  if (state.path == null) {
    await menuFileSaveAs()
    return
  }
  await fs.writeTextFile(state.path, state.code)
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
  await fs.writeTextFile(userFile, editorStore.currentEditorValue.code)
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
