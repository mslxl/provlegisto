import { lazy } from "react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"

const PageMain = lazy(() => import("./pages/Main"))
const PagePreference = lazy(() => import("./pages/Preference"))

const router = createMemoryRouter([
  {
    path: "/",
    element: <PageMain />,
  },
  {
    path: "/preference",
    element: <PagePreference />,
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
