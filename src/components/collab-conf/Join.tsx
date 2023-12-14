import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import { signalingServerAtom, whoamiAtom } from "@/store/setting/collab"
import { collabRoomAtom, useSetupWebRTC } from "@/store/collab"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
const roomSchema = z.object({
  signal: z.string(),
  username: z.string(),
  roomid: z.string().min(4).max(86),
})

export default function Join() {
  const [signal, setSignal] = useAtom(signalingServerAtom)
  const [username, setUsername] = useAtom(whoamiAtom)
  const [roomId, setRoomId] = useAtom(collabRoomAtom)

  const form = useForm<z.infer<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      username,
      signal,
      roomid: roomId ?? "",
    },
  })

  const setupWebRTC = useSetupWebRTC()

  function onConfirm(value: z.infer<typeof roomSchema>) {
    setUsername(value.username)
    setRoomId(value.roomid)
    setSignal(value.signal)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConfirm)}>
          <FormField
            control={form.control}
            name="signal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracker Server</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UserName</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Apply</Button>
        </form>
        <Button onClick={()=>setupWebRTC(true)}>Start</Button>
      </Form>
    </div>
  )
}
