import { window } from "@tauri-apps/api"
import { onMounted, onUnmounted } from "vue"

export function useDocumentTitle(title: string): void {
  const win = window.getCurrent()
  let before = ""
  onMounted(() => {
    win
      .title()
      .then(async (b) => {
        before = b
        await win.setTitle(title)
      })
      .catch(console.error)
  })
  onUnmounted(() => {
    win.setTitle(before).catch(console.error)
  })
}
