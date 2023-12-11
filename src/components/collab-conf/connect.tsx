import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import * as log from "tauri-plugin-log-api"
import * as z from "zod"
import useReadAtom from "@/hooks/useReadAtom"
import { connectAtom, hostIPAtom, hostPortAtom, hostingAtom } from "@/store/collab"
import { dialog } from "@tauri-apps/api"
import { haveSourceOpenedAtom } from "@/store/source"
import { useAtomValue, useSetAtom } from "jotai"

const connectSchema = z.object({
  host: z.string().ip({ version: "v4" }),
  port: z.coerce
    .number()
    .min(1)
    .max(Math.pow(2, 32) - 1),
})

export default function Connect() {
  const form = useForm<z.infer<typeof connectSchema>>({
    resolver: zodResolver(connectSchema),
  })
  const readHosting = useReadAtom(hostingAtom)
  const haveOpened = useAtomValue(haveSourceOpenedAtom)

  const setIsConnect = useSetAtom(connectAtom)
  const setHostPort = useSetAtom(hostPortAtom)
  const setHostIp = useSetAtom(hostIPAtom)

  async function onSubmit(values: z.infer<typeof connectSchema>) {
    log.info("connect " + JSON.stringify(values))
    if (readHosting()) {
      await dialog.message("Can not connect to other server when host as server", {
        type: "error",
      })
      return
    }
    if (haveOpened) {
      await dialog.message("Start hosting required no file was created", {
        type: "error",
      })
      return
    }
    setHostIp(values.host)
    setHostPort(values.port)
    setIsConnect(true)
  }

  return (
    <div className="py-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Connect</Button>
        </form>
      </Form>
    </div>
  )
}
