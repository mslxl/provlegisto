import { Button } from "@/components/ui/button"
import {
  collabCookieAtom,
  collabDisplayNameAtom,
  collabSignalingServerAtom,
  collabUsernameAtom,
} from "@/store/setting/collab"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { dialog } from "@tauri-apps/api"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import Loading from "@/components/loading"
import { useFetchProfile } from "@/store/collab"
export function CollabUserInfo() {
  const collabSignalingServer = useAtomValue(collabSignalingServerAtom)
  const [loginUsername, setLoginUsername] = useAtom(collabUsernameAtom)
  const [realname, setRealname] = useState("")
  const [displayName, setDisplyName] = useAtom(collabDisplayNameAtom)
  const setCookie = useSetAtom(collabCookieAtom)

  async function logout(confirm: boolean) {
    if (confirm) {
      if (!(await dialog.ask("Logout account?", { title: "logout", type: "info" }))) {
        return
      }
    }
    setCookie("")
  }
  const profileFetcher = useFetchProfile()

  async function refreshProfile() {
    const data = await profileFetcher.requestProfile()
    console.log(data)
    if (data.status == 0) {
      setRealname(data.data!.realName ?? "")
      setDisplyName(data.data!.displayName)
      setLoginUsername(data.data!.username)
    } else {
      dialog.message(data.error!, {
        title: "Refresh fail",
        type: "error",
      })
      logout(false)
    }
  }
  useEffect(() => {
    refreshProfile()
  }, [])

  if (profileFetcher.loading) {
    return <Loading />
  }

  return (
    <div className="flex">
      <div className="flex-1">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Server</TableCell>
              <TableCell>{collabSignalingServer}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>{loginUsername}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Display Name</TableCell>
              <TableCell>{displayName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Real Name</TableCell>
              <TableCell>{realname}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4 ml-4 flex flex-col justify-end">
        <Button variant="outline" onClick={refreshProfile}>
          Refresh
        </Button>
        <Button variant="destructive" onClick={() => logout(true)}>
          Logout
        </Button>
      </div>
    </div>
  )
}
