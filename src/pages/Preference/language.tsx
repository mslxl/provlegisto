import PrefSelect from "@/components/pref/Select"
import SetupCXX from "@/components/setup/setup-cxx"
import SetupPy from "@/components/setup/setup-py"
import { availableLanguageListAtom, defaultLanguageAtom } from "@/store/setting/setup"
import { useAtom, useAtomValue } from "jotai"

export default function Page() {
  const availableLanguageList = useAtomValue(availableLanguageListAtom)
  //TODO: type check here, maybe the best way is to wrap another component?
  const [defaultLanguage, setDefaultLanguage] = useAtom(defaultLanguageAtom)
  return (
    <ul>
      <li>
        <PrefSelect
          leading="Default Language:"
          items={availableLanguageList.state == "hasData" ? availableLanguageList.data : []}
          value={defaultLanguage!}
          onChange={setDefaultLanguage as any} 
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
