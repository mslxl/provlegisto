import clsx from "clsx"
import { useAtomValue, useSetAtom } from "jotai"
import { ImExit } from "react-icons/im"
import { OnlineUserInfo, disconnectProviderAtom, onlineUsersAtom } from "@/store/source/provider"
import { activedSourceIdAtom, sourceAtom } from "@/store/source"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { useRef } from "react"
import { useHoverDirty } from "react-use"
import { dialog } from "@tauri-apps/api"

interface UserInfoProps {
  user: OnlineUserInfo
}

function UserInfo(props: UserInfoProps) {
  const store = useAtomValue(sourceAtom)
  const focusSourceName = store.get(props.user.activeId)?.useName()
  const isIdle = (focusSourceName?.length ?? 0) == 0
  const setActivedSource = useSetAtom(activedSourceIdAtom)
  function changeActiveSource() {
    if (!isIdle) {
      setActivedSource(props.user.activeId)
    }
  }
  return (
    <li className="flex items-center space-x-4 border py-2 px-4">
      <Avatar className="shadow-md">
        <AvatarFallback className="font-bold text-white" style={{ background: props.user.color }}>
          {props.user.name.substring(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{props.user.name}</p>
        <p
          className={clsx("text-sm text-muted-foreground truncate", {
            italic: isIdle,
            "cursor-not-allowed": isIdle,
            "cursor-pointer": !isIdle,
          })}
          onClick={changeActiveSource}
        >
          {isIdle ? "IDLE" : focusSourceName}
        </p>
      </div>
    </li>
  )
}

interface ConnectedProps {
  className?: string
}

export default function Connected(props: ConnectedProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const disconnect = useSetAtom(disconnectProviderAtom)
  const onlineUsers = useAtomValue(onlineUsersAtom)
  const isHover = useHoverDirty(panelRef)

  async function exitRoom(){
    if(await dialog.ask('Are you sure to exit current room?', {title: 'Exit'})){
      disconnect()
    }
  }

  return (
    <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")} ref={panelRef}>
      <div className="shadow-sm flex pl-2 top-0 bg-accent">
        <span className="truncate font-semibold">ONLINE USERS</span>
        <span className="flex-1"></span>
        <button className={clsx("p-1 hover:bg-neutral-200", {hidden: !isHover})} onClick={exitRoom}>
          <ImExit />
        </button>
      </div>
      <ul className="space-y-2 w-full p-1">
        {onlineUsers.map((info) => (
          <UserInfo key={info.clientId} user={info} />
        ))}
      </ul>
    </div>
  )
}
