import { PrefBool } from "@/components/pref/Bool"
import { collabEnableAtom } from "@/store/setting/collab"
export default function Collab() {

  return (
    <ul>
      <li>
        <PrefBool leading="Enable Collaborative Editing" atom={collabEnableAtom as any} />
      </li>
    </ul>
  )
}
