import { collabLoginAtom } from "@/store/setting/collab"
import { useAtomValue } from "jotai"
import CollabLoginForm from "../../../components/collab-info/user/login-form"
import { CollabUserInfo } from "../../../components/collab-info/user/user-info"

export function UserProfile() {
  const collabLogin = useAtomValue(collabLoginAtom)
  return collabLogin ? <CollabUserInfo /> : <CollabLoginForm />
}
