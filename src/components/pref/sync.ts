import { syncPreferenceCrossWindows } from "../../lib/syncPref"
import { useSettingStore } from "../../store/settings"

export default function sync(): void {
  const store = useSettingStore()
  syncPreferenceCrossWindows(store.$state).catch(console.error)
}
