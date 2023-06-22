import settingsManager from "./lib/settings";

import './theme.scss'


settingsManager.get('theme').then((theme)=>{
  console.log(theme)
  document.querySelector('html')?.setAttribute('theme', theme)
})





