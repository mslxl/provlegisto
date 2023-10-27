import { invoke } from "@tauri-apps/api"
import bus from "../bus"
import { type SettingsState } from "../store/settings"
export async function syncPreferenceCrossWindows(state: SettingsState): Promise<void> {
  await Promise.all([bus.emitCrossWindows("sync:pref", state), syncPreferenceToLocal(state)])
}

export async function syncPreferenceToLocal(state: SettingsState): Promise<void> {
  await invoke("sync_settings", {
    data: JSON.stringify(state),
  })
}

export function useListenPreferenceChangeHook(dispatcher: (state: SettingsState) => void): void {
  bus.$on("sync:pref", (data: any) => {
    dispatcher(data as SettingsState)
  })
}
