import { SettingsManager } from 'tauri-settings'

interface SettingSchema {
  theme: 'dark' | 'light' | 'paper';
}

const settingsManager = new SettingsManager<SettingSchema>(
  { // defaults
    theme: 'paper',
  },
  {
    // dir: '.'
  }
)

await settingsManager.initialize()
await settingsManager.syncCache()

export default settingsManager