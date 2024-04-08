import clsx from "clsx"
import { Button } from "../ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import * as log from "tauri-plugin-log-api"
import { useAtom, useSetAtom } from "jotai"
import { connectProviderAtom } from "@/store/source/provider"
import { collabConnectFormSchema, lastConnectFormAtom } from "@/store/setting/form"
import { dialog } from "@tauri-apps/api"
import { MdOutlineNumbers } from "react-icons/md"
import { random } from "lodash/fp"
import { useState } from "react"

interface Unconnection {
  className?: string
}

export default function Unconnect(props: Unconnection) {
  const [lastConnectForm, setLastConnectForm] = useAtom(lastConnectFormAtom)

  const form = useForm<z.infer<typeof collabConnectFormSchema>>({
    resolver: zodResolver(collabConnectFormSchema),
    defaultValues: lastConnectForm || {
      p2p: true,
      color: random(0, 0xffffff).toString(16).padStart(6, "0"),
      username: "Anonymous " + Math.floor(Math.random() * 100),
    },
  })

  const providerConnect = useSetAtom(connectProviderAtom)

  function onConfirm(values: z.infer<typeof collabConnectFormSchema>) {
    log.info(`connect with ${JSON.stringify(values)}`)
    setLastConnectForm(values)
    providerConnect(values.server, values.roomName, { color: `#${values.color}`, name: values.username }).catch(() => {
      dialog.message("Connect fail in 3 times", { title: "Network Error", type: "error" })
    })
  }

  return (
    <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")}>
      <Form {...form}>
        <form
          className="m-4"
          onSubmit={form.handleSubmit(onConfirm)}
          autoComplete="false"
          autoCapitalize="false"
          autoCorrect="false"
        >
          <FormField
            control={form.control}
            name="p2p"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Use End2End Connection</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="server"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server</FormLabel>
                <FormControl>
                  <Input placeholder="wss://" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => {
              const [colorPreview, setColorPreview] = useState(field.value)

              return (
                <FormItem>
                  <FormLabel>User Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-1">
                      <MdOutlineNumbers />
                      <Input
                        onChange={(v) => {
                          setColorPreview(v.target.value)
                          field.onChange(v)
                        }}
                        value={field.value}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        name={field.name}
                        disabled={field.disabled}
                      />
                      <div
                        className="w-8 h-8 border-teal-950 border-2 rounded-md inline-block"
                        style={{ background: `#${colorPreview}` }}
                      ></div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <div className="w-full p-4">
            <Button type="submit" className="w-full">
              Create / Join
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
