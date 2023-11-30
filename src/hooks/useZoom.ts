import { zoomState } from "@/store/setting"
import { useAtom } from "jotai"
import { useEffect } from "react"

export function useZoom() {
  const [zoomValue] = useAtom(zoomState)
  useEffect(() => {
    ;(document.body.style as any).zoom = zoomValue
  }, [zoomValue])
}
