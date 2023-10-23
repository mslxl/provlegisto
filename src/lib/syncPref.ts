import bus from "../bus"
import { type SettingsState } from "../store/settings"
export async function syncPreferenceCrossWindows(state: SettingsState): Promise<void> {
  await bus.emitCrossWindows("sync:pref", state)
}

export function useListenPreferenceChangeHook(dispatcher: (state: SettingsState) => void): void {
  bus.$on("sync:pref", (data: any) => {
    dispatcher(data as SettingsState)
  })
}
