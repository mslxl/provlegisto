import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { collabCookieAtom, collabSignalingServerAtom, collabUsernameAtom } from "@/store/setting/collab"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSignalServerAxios } from "@/hooks/useAxios"
import { dialog } from "@tauri-apps/api"
import { filter, join, map } from "lodash"
import Loading from "@/components/loading"

const schema = z.object({
  signaling: z.string(),
  username: z.string().min(4),
  password: z.string().min(6),
})
export default function CollabLoginForm() {
  const { axios, loading } = useSignalServerAxios()
  const setCookie = useSetAtom(collabCookieAtom)
  const loginUsername = useAtomValue(collabUsernameAtom)
  const [collabSignalingServer, setCollabSignalServer] = useAtom(collabSignalingServerAtom)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      signaling: collabSignalingServer,
      username: loginUsername,
    },
  })
  async function onConfirm(value: z.infer<typeof schema>) {
    const response = await axios.post(
      "/user/login",
      {
        username: value.username,
        password: value.password,
      },
      {
        baseURL: value.signaling,
      },
    )
    const data = response.data
    console.log(response)
    if (data.status == 0) {
      let cookies = ""
      if (response.headers["set-cookie"]) {
        if (typeof response.headers["set-cookie"] == "string") {
          const headerCookie = response.headers["set-cookie"] as string
          cookies = headerCookie.substring(0, headerCookie.indexOf(";"))
        } else {
          cookies = join(
            map(
              filter(response.headers["set-cookie"] ?? [], (s: string) => s.length > 0),
              (s: string) => s.substring(0, s.indexOf(";")),
            ),
            ";",
          )
        }
      }

      setCookie(cookies)
      setCollabSignalServer(value.signaling)
    } else {
      dialog.message(data.error, {
        title: "Login Fail",
        type: "error",
      })
    }
  }
  if (loading) {
    return <Loading />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-2" autoComplete="off">
        <FormField
          name="signaling"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登录</Button>
      </form>
    </Form>
  )
}
