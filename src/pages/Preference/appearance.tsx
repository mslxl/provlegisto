import { PrefNumber } from "@/components/pref/Number"
import { zoomStateAtom } from "@/store/setting/ui"
import { useAtom } from "jotai"

export default function Page() {
  const [zoomState, setZoomState] = useAtom(zoomStateAtom)

  return (
    <ul>
      <li>
        <PrefNumber leading="Zoom" value={zoomState} onChange={setZoomState} min={0.5} max={1.5} step={0.1} />
      </li>
    </ul>
  )
}
