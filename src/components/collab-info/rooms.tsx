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
  DialogTrigger,
} from "../ui/dialog"
import Loading from "../loading"
import CreateRoomComponent from "./create-room"
import { JoinRoomComponent } from "./join-room"
import { Room, RoomItem } from "./room-item"



export default function SignalRoom() {
  const { axios, loading } = useSignalServerAxios()
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Room[]>([])
  const [dialogVisible, setDialogVisible] = useState(false)
  const [selectRoom, setSelectRoom] = useState<Room | null>(null)
  const [createDialogVisible, setCreateDialogVisible] = useState(false)

  async function fetchPage() {
    setError(null)
    const response = (
      await axios.get("/room", {
        params: {
          page,
        },
      })
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
  }, [page])
  function nextPage() {
    if (data.length > 0) {
      setPage((v) => v + 1)
    }
  }
  function prevPage() {
    if (page > 0) {
      setPage((v) => v - 1)
    }
  }

  function showJoinRoomDialogOf(room: Room) {
    setSelectRoom(room)
    setDialogVisible(true)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="h-full overflow-y-auto">
      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent>
          <JoinRoomComponent onOpenChanged={setDialogVisible} room={selectRoom}/>
        </DialogContent>
      </Dialog>
      <Dialog open={createDialogVisible} onOpenChange={setCreateDialogVisible}>
        <DialogContent>
          <CreateRoomComponent onOpenChanged={setCreateDialogVisible} />
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 justify-end p-2">
        <Button size="icon" variant="outline" onClick={fetchPage}>
          <LucideRefreshCcw />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <LucideMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setCreateDialogVisible(true)}>Create Room</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-4 flex-1 min-h-0">
        {error != null ? (
          <div className="flex flex-row">
            <div className="p-4 min-h-0 flex-shrink">
              <h3 className="font-bold text-3xl text-center">Error</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <div className="border-neutral-800 border-2 text-ellipsis h-1/3  overflow-hidden p-4 select-text hover:bg-neutral-400">
                    {error}
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogDescription>{error}</DialogDescription>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <ul>
            {data.map((r) => (
              <RoomItem room={r} onClick={() => showJoinRoomDialogOf(r)} />
            ))}
            <li className="m-4 grid grid-cols-3 gap-4">
              <span>
                Page:
                {page}
              </span>
              <Button onClick={prevPage} variant="outline">
                Prev
              </Button>
              <Button onClick={nextPage} variant="outline">
                Next
              </Button>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}
