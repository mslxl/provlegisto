import { Suspense, lazy } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

import Loading from "@/components/loading"
const PageMain = lazy(() => import("@/pages/Main"))
const PagePreference = {
  Layout: lazy(() => import("@/pages/Preference")),
  Appearance: lazy(() => import("@/pages/Preference/appearance")),
  Editor: lazy(() => import("@/pages/Preference/editor")),
  Keymap: lazy(() => import("@/pages/Preference/keymap")),
  Language: lazy(() => import("@/pages/Preference/language")),
}
const PageSetup = lazy(() => import("@/pages/Setup"))
const PageInstall = lazy(() => import("@/pages/Install"))

const PageAbout = lazy(() => import("@/pages/About"))
const router = createBrowserRouter([
  {
    path: "/",
    element: <PageSetup />,
  },
  {
    path: "/editor",
    element: <PageMain />,
  },
  {
    path: "/pref",
    element: <PagePreference.Layout />,
    children: [
      {
        path: "/pref",
        element: <PagePreference.Appearance />,
      },
      {
        path: "/pref/editor",
        element: <PagePreference.Editor />,
      },
      {
        path: "/pref/keymap",
        element: <PagePreference.Keymap />,
      },
      {
        path: "/pref/lang",
        element: <PagePreference.Language />,
      },
    ],
  },
  {
    path: "/about",
    element: <PageAbout />,
  },
  {
    path: "/setup",
    element: <PageSetup />,
  },
  {
    path: "/install/:name",
    element: <PageInstall />,
  },
])

export default function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
