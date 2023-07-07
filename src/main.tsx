import React from "react";
import ReactDOM from "react-dom/client";
import './i18n'

import 'normalize.css'
import './theme'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Welcome from './views/Welcome';
import ErrorPage from './views/ErrorPage'
import GlobalPreference from './views/GlobalPreference'

import './settings'

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
