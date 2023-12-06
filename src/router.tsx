import { Suspense, lazy } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"

import Loading from "@/components/loading"
import { AnimatePresence } from "framer-motion"
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
    path: "/setup",
    element: (
      <AnimatePresence mode="wait">
        <PageSetup />
      </AnimatePresence>
    ),
  },
  {
    path: "/",
    element: (
      <AnimatePresence mode="wait">
        <PageMain />
      </AnimatePresence>
    ),
  },
  {
    path: "/pref",
    element: (
      <AnimatePresence mode="wait">
        <PagePreference.Layout />
      </AnimatePresence>
    ),
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
    element: (
      <AnimatePresence mode="wait">
        <PageAbout />
      </AnimatePresence>
    ),
  },
  {
    path: "/setup",
    element: (
      <AnimatePresence mode="wait">
        <PageSetup />
      </AnimatePresence>
    ),
  },
  {
    path: "/install/:name",
    element: (
      <AnimatePresence mode="wait">
        <PageInstall />
      </AnimatePresence>
    ),
  },
])

export default function Router() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
