import { useAtom, useSetAtom } from "jotai"
import { Label } from "../ui/label"
import { Switch } from "../ui/switch"
import { connectionAtom, hostIPAtom, hostPortAtom, hostingAtom } from "@/store/collab"
import { collabStart } from "@/lib/ipc/collab"
import TauriWSTransport from "@/lib/TauriWSTransport"
import Client, { RequestManager } from "@open-rpc/client-js"

export default function Host() {
  const [isHosting, setIsHosting] = useAtom(hostingAtom)
  const [hostPort, setHostPort] = useAtom(hostPortAtom)
  const setHostIp = useSetAtom(hostIPAtom)
  const setConnection = useSetAtom(connectionAtom)

  async function setHost(status: boolean) {
    if (status) {
      const port = await collabStart()
      setHostPort(port)
      setHostIp("127.0.0.1")

      const transport = new TauriWSTransport(`ws://127.0.0.1:${port}`)
      const requestManager = new RequestManager([transport])
      const client = new Client(requestManager)
      try {
        await client.request({ method: "ping" })
      } catch {
        return
      }
      setConnection(client)
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
