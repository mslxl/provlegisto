import { useRef } from "react"
import { Button } from "../ui/button"
import { DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useJoinRoomController } from "@/store/collab"
import { dialog } from "@tauri-apps/api"
import Loading from "../loading"
import { Room, RoomItem } from "./room-item"

type JoinRoomComponentProps = {
  room: Room | null
  onOpenChanged: (visible: boolean) => void
}

export function JoinRoomComponent(props: JoinRoomComponentProps) {
  const passwordRef = useRef("")

  const joinController = useJoinRoomController()
  async function join() {
    const pwd = passwordRef.current.length == 0 ? undefined : passwordRef.current
    const response = await joinController.send(props.room!.id, pwd)
    if (response.status != 0) {
      dialog.message(response.error, {
        title: "Fail to join",
        type: "error",
      })
    }
    props.onOpenChanged(false)
  }
  if (joinController.loading) {
    return <Loading />
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Join Room</DialogTitle>
      </DialogHeader>
      <ul>{props.room && <RoomItem room={props.room} />}</ul>
      {props.room?.passwordRequired && (
        <>
          <Label>Password</Label>
          <Input type="password" onChange={(e) => (passwordRef.current = e.target.value)} />
        </>
      )}
      <div className="text-right space-x-2">
        <Button onClick={() => props.onOpenChanged(false)} variant="outline">
          Cancel
        </Button>
        <Button onClick={join}>Join</Button>
      </div>
    </>
  )
}
