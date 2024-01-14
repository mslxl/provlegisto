import { VscAccount, VscLock } from "react-icons/vsc"
import clsx from "clsx"
import { Separator } from "../ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

export type Room = {
  allowAnonymous: boolean
  createTime: number
  id: number
  max: number
  name: string
  owner: string
  passwordRequired: boolean
}

type RoomItemProps = {
  room: Room
  className?: string
  onClick?: () => void
}
export function RoomItem(props: RoomItemProps) {
  const r = props.room
  return (
    <li key={r.id} className={clsx("py-1 hover:bg-neutral-200", props.className)} onClick={props.onClick}>
      <div>
        <div className="flex items-center min-h-0">
          <div className="flex-1">
            <h3 className="flex-1 text-xl font-semibold">{r.name}</h3>
          </div>
          <ul className="flex space-x-2">
            <TooltipProvider>
              <li
                className={clsx({
                  hidden: r.allowAnonymous,
                })}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <VscAccount />
                  </TooltipTrigger>
                  <TooltipContent>Login required</TooltipContent>
                </Tooltip>
              </li>
              <li
                className={clsx({
                  hidden: !r.passwordRequired,
                })}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <VscLock />
                  </TooltipTrigger>
                  <TooltipContent>Password required</TooltipContent>
                </Tooltip>
              </li>
            </TooltipProvider>
          </ul>
        </div>
        <span className="text-sm text-neutral-600">{r.owner}</span>
      </div>
    </li>
  )
}
