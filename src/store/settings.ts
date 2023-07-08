import { create } from 'zustand'
import { combine, createJSONStorage, persist, StateStorage } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api'


// export const useSettingsStore = create((set) => ({
//   theme: 'Light',
//   setTheme: (theme: string) => set(() => ({ theme: theme }))
// }))
class TauriSettingStorage implements StateStorage {
  async getItem(name: string): Promise<string> {
    return invoke("get_setting_item", { name })
  }
  async setItem(name: string, value: string) {
    await invoke('set_setting_item', { name, value })
  }
  async removeItem(name: string) {
    await invoke('rm_setting_item', { name })
  }
}

export const useSettingsStore = create(
  persist(
    combine({ theme: 'Light' }, (set) => ({
      setTheme: (theme: string) => set(() => ({ theme: theme }))
    })),
    {
      name: 'settings',
      storage: createJSONStorage(() => new TauriSettingStorage())
    })
)