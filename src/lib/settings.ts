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

settingsManager.initialize().then(()=>{
  settingsManager.syncCache()
})

export default settingsManager