import PrefSelect from "@/components/pref/Select"
import { keymapStateAtom, keymapValues } from "@/store/setting/keymap"

export default function Page() {
  return (
    <ul>
      <li>
        <PrefSelect leading="Basic Keymap" items={keymapValues} atom={keymapStateAtom as any} />
      </li>
    </ul>
  )
}
