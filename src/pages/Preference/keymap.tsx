import PrefSelect from "@/components/pref/Select"
import { keymapState, keymapValues } from "@/store/setting/keymap"

export default function Page() {
  return (
    <ul>
      <li>
        <PrefSelect leading="Basic Keymap" items={keymapValues} atom={keymapState as any} />
      </li>
    </ul>
  )
}
