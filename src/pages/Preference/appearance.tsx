import { PrefNumber } from "@/components/pref"
import { zoomStateAtom } from "@/store/setting/ui"

export default function Page() {
  return (
    <ul>
      <li>
        <PrefNumber leading="Zoom" atom={zoomStateAtom as any} min={0.5} max={1.5} step={0.1} />
      </li>
    </ul>
  )
}
