import PrefSelect from "@/components/pref/Select"
import SetupCXX from "@/components/setup/setup-cxx"
import SetupPy from "@/components/setup/setup-py"
import { availableLanguageListAtom, defaultLanguageAtom } from "@/store/setting/setup"
import { useAtomValue } from "jotai"

export default function Page() {
  const availableLanguageList = useAtomValue(availableLanguageListAtom)
  return (
    <ul>
      <li>
        <PrefSelect
          leading="Default Language:"
          items={availableLanguageList.state == "hasData" ? availableLanguageList.data : []}
          atom={defaultLanguageAtom as any}
        />
      </li>
      <li>
        <SetupCXX />
      </li>
      <li>
        <SetupPy />
      </li>
    </ul>
  )
}
