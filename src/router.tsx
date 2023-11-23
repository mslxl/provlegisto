import { Suspense, lazy } from "react"
import { RouterProvider, createMemoryRouter } from "react-router-dom"

import Loading from "@/components/loading"
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
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
