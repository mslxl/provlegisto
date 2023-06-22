import React from "react";
import ReactDOM from "react-dom/client";
import './i18n'

import 'normalize.css'
import './theme'
import Welcome from "./views/Welcome";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Welcome/>
  </React.StrictMode>
);
