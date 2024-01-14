import { useForm } from "react-hook-form"
import { DialogHeader, DialogTitle } from "../ui/dialog"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { useSignalServerAxios } from "@/hooks/useAxios"
import Loading from "../loading"
import { dialog } from "@tauri-apps/api"
import { useJoinRoomController } from "@/store/collab"

const schema = z.object({
  name: z.string().min(2),
  max: z.coerce.number().min(2),
  password: z.string().min(6).or(z.undefined()).or(z.string().max(0)),
  allowAnonymous: z.boolean(),
})

type CreateRoomProps = {
  onOpenChanged: (visible: boolean) => void
}

export default function CreateRoom(props: CreateRoomProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      max: 3,
      allowAnonymous: false
    }
  })

  const { axios, loading } = useSignalServerAxios()
  const joinController = useJoinRoomController()

  async function onSubmit(value: z.infer<typeof schema>) {
    const response = (
      await axios.post("/room", {
        name: value.name,
        max: value.max,
        password: value.password == undefined || value.password.length == 0 ? undefined : value.password,
        allowAnonymous: value.allowAnonymous,
      })
    ).data
    console.log(response)
    if (response.status != 0) {
      await dialog.message(response.error, {
        title: "Create Room Fail",
        type: "error",
      })
      return
    }
    const roomId = response.data as number
    const joinRes = await joinController.send(roomId, value.password)
    if(joinRes.status != 0){
      await dialog.message(response.error, {
        title: "Join Room Fail",
        type: "error",
      })
    }
    props.onOpenChanged(false)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Room</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2" autoComplete="off" autoCapitalize="off">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="max"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Capacity</FormLabel>
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
                <FormLabel>Room Password(Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="allowAnonymous"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox defaultChecked={field.value} onCheckedChange={field.onChange} id="allowAnonymous" />
                </FormControl>
                <FormLabel className="pl-2" htmlFor="allowAnonymous">
                  Allow the anonymous join
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-end">
            <Button>Create</Button>
          </div>
        </form>
      </Form>
    </>
  )
}
