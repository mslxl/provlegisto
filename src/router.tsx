import { lazy } from "react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"

const PageMain = lazy(() => import("@/pages/Main"))
const PagePreference = lazy(() => import("@/pages/Preference"))
const PageAbout = lazy(() => import("@/pages/About"))

const router = createMemoryRouter([
  {
    path: "/",
    element: <PageMain />,
  },
  {
    path: "/preference",
    element: <PagePreference />,
  },
  {
    path: "/about",
    element: <PageAbout />,
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
