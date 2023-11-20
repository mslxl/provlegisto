import { lazy } from "react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"

const PageMain = lazy(() => import("./pages/Main"))

const router = createMemoryRouter([
  {
    path: "/",
    element: <PageMain />,
  },
])

export default function Router() {
  return <RouterProvider router={router} />
}
