import React from "react";
import ReactDOM from "react-dom/client";

import 'normalize.css'
import './style.less'
import './theme'
import './i18n'
import Welcome from "./views/Welcome";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Welcome/>
  </React.StrictMode>
);
