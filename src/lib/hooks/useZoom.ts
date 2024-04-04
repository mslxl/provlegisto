import { zoomStateAtom } from "@/store/setting/ui"
import { useAtom } from "jotai"
import { useEffect } from "react"

export function useZoom() {
  const [zoomValue] = useAtom(zoomStateAtom)
  useEffect(() => {
    ;(document.body.style as any).zoom = zoomValue
  }, [zoomValue])
}
