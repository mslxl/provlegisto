import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import './i18n'

import 'normalize.css'
import './theme'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Welcome from './views/Welcome';
import ErrorPage from './views/ErrorPage'
import GlobalPreference from './views/GlobalPreference'

import './settings'
import { useSettingsStore } from "./store/settings";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />,
    errorElement: <ErrorPage />
  },
  {
    path: '/preference/global',
    element: <GlobalPreference />,
  }
])


function Page() {
  const theme: string = useSettingsStore((state: any) => state.theme)
  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme.toLowerCase())
  })
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Page />
);
