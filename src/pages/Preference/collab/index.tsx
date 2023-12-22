import { PrefBool } from "@/components/pref/Bool"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collabEnableAtom, collabLoginAtom } from "@/store/setting/collab"
import clsx from "clsx"
import { useAtomValue } from "jotai"
import CollabLoginForm from "./login-form"
import { CollabUserInfo } from "./user-info"

export default function Collab() {
  const collabEnable = useAtomValue(collabEnableAtom)
  const collabLogin = useAtomValue(collabLoginAtom)

  return (
    <ul>
      <li>
        <PrefBool leading="Enable Collaborative Editing" atom={collabEnableAtom as any} />
      </li>
      <li className={clsx({ hidden: !collabEnable })}>
        <Card className="my-4">
          <CardHeader>
            <CardTitle>Signaling Server</CardTitle>
          </CardHeader>
          <CardContent>
            {!collabLogin && <CollabLoginForm />}
            {collabLogin && <CollabUserInfo />}
          </CardContent>
        </Card>
      </li>
    </ul>
  )
}
