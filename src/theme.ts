import settingsManager from "./settings";

import './theme.less'


settingsManager.get('theme').then((theme)=>{
  console.log(theme)
  document.querySelector('html')?.setAttribute('theme', theme)
})





