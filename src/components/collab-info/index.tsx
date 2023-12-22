import clsx from "clsx"
import { Suspense, lazy } from "react"
import { useAtomValue } from "jotai"
import { collabProviderAtom } from "@/store/collab"
import Loading from "../loading"

type CollabProps = {
  className?: string
}

export default function Collab(props: CollabProps) {
  const yProvider = useAtomValue(collabProviderAtom)
  const Component = yProvider == null ? lazy(() => import("./rooms")) : lazy(() => import("./online"))
  return (
    <div className={clsx(props.className, "h-full select-none")}>
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </div>
  )
}
