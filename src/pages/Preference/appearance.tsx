import { PrefNumber } from "@/components/pref"
import { zoomState } from "@/store/setting"

export default function Page() {
  return (
    <ul>
      <li>
        <PrefNumber leading="Zoom" atom={zoomState as any} min={0.5} max={1.5} step={0.1} />
      </li>
    </ul>
  )
}
