import { useSignalServerAxios } from "@/hooks/useAxios"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { LucideMenu, LucideRefreshCcw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import Loading from "../loading"
import CreateRoomComponent from "./create-room"
import { JoinRoomComponent } from "./join-room"
import { Room, RoomItem } from "./room-item"
import { VscCommentDiscussion, VscError } from "react-icons/vsc"
import { Separator } from "../ui/separator"

export default function SignalRoom() {
  const { axios, loading } = useSignalServerAxios()
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Room[]>([])
  const [dialogVisible, setDialogVisible] = useState(false)
  const [selectRoom, setSelectRoom] = useState<Room | null>(null)
  const [createDialogVisible, setCreateDialogVisible] = useState(false)

  async function fetchPage() {
    setError(null)
    const response = (
      await axios.get("/room")
    ).data
    console.log(response)
    if (response.status != 0) {
      setError(response.error)
      return
    }
    const data = response.data
    setData(data)
  }

  useEffect(() => {
    fetchPage()
  }, [])

  function showJoinRoomDialogOf(room: Room) {
    setSelectRoom(room)
    setDialogVisible(true)
  }

  if (loading) {
    return <Loading />
  }

  function showCreateDialog() {
    setCreateDialogVisible(true)
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent>
          <JoinRoomComponent onOpenChanged={setDialogVisible} room={selectRoom} />
        </DialogContent>
      </Dialog>
      <Dialog open={createDialogVisible} onOpenChange={setCreateDialogVisible}>
        <DialogContent>
          <CreateRoomComponent onOpenChanged={setCreateDialogVisible} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 justify-end p-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Room List</h3>
        </div>
        <Button size="icon" variant="ghost" onClick={fetchPage} className="w-[16px] h-[16px]">
          <LucideRefreshCcw />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="w-[16px] h-[16px]">
              <LucideMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled={error != null} onClick={showCreateDialog}>
              Create Room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <div className="flex-1 min-h-0">
        {error != null ? (
          <div className="h-full flex flex-row items-center">
            <div className="p-4 min-h-0 flex-shrink">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="p-4">
                    <h3 className="text-4xl text-red-700 flex flex-col items-center p-2">
                      <VscError />
                    </h3>
                    <div className="text-ellipsis overflow-hidden select-text line-clamp-3">{error}</div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Error</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>{error}</DialogDescription>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : data.length == 0 ? (
          <div className="h-full flex flex-row items-center justify-center">
            <div className="p-4">
              <h3 className="text-4xl flex flex-col items-center p-2">
                <VscCommentDiscussion />
              </h3>
              <div className="space-y-2">
                <div className="text-center">It's so slience now</div>
                <Button variant="secondary" onClick={showCreateDialog}>
                  Create My Room
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <ul>
              {data.map((r) => (
                <RoomItem room={r} className="px-4" onClick={() => showJoinRoomDialogOf(r)} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
