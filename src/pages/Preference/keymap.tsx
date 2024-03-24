import PrefSelect from "@/components/pref/Select"
import { keymapStateAtom, keymapValues } from "@/store/setting/keymap"
import { useAtom } from "jotai"

export default function Page() {
  const [keymapState, setKeymapState] = useAtom(keymapStateAtom)
  return (
    <ul>
      <li>
        <PrefSelect leading="Basic Keymap" items={keymapValues} value={keymapState} onChange={setKeymapState} />
      </li>
    </ul>
  )
}
