import { useAtom, useSetAtom } from "jotai"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { hostIPAtom, hostPortAtom, hostingAtom } from "@/store/collab"
import { collabStart } from "@/lib/ipc/collab"

export default function Host() {
  const [isHosting, setIsHosting] = useAtom(hostingAtom)
  const [hostPort, setHostPort] = useAtom(hostPortAtom)
  const setHostIp = useSetAtom(hostIPAtom)

  async function setHost(status: boolean) {
    if (status) {
      collabStart().then((port) => {
        setHostPort(port)
        setHostIp("127.0.0.1")
      })
    }
    setIsHosting(status)
  }

  return (
    <div className="py-4">
      <ul>
        <li>
          <div className="flex items-center gap-2 text-md">
            <Switch id="host-switch" checked={isHosting} onCheckedChange={setHost} />
            <Label htmlFor="host-switch">Server</Label>
          </div>
          {isHosting && <div className="text-sm my-2">Port: {hostPort}</div>}
        </li>
      </ul>
    </div>
  )
}
