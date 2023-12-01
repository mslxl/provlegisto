import { zoomStateAtom } from "@/store/setting"
import { useAtom } from "jotai"
import { useEffect } from "react"

export function useZoom() {
  const [zoomValue] = useAtom(zoomStateAtom)
  useEffect(() => {
    ;(document.body.style as any).zoom = zoomValue
  }, [zoomValue])
}
