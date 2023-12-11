import clsx from "clsx"
import { Button } from "../ui/button"
import { VscLink } from "react-icons/vsc"
import CollabConf from "../collab-conf"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { useAtomValue } from "jotai"
import { hostPortAtom, hostingAtom } from "@/store/collab"

type CollabProps = {
  className?: string
}
export default function Collab(props: CollabProps) {
  const [confDialog, setConfDialog] = useState(false)
  const hostPort = useAtomValue(hostPortAtom)
  const isHost = useAtomValue(hostingAtom)
  return (
    <div className={clsx(props.className, "h-full select-none")}>
      <CollabConf open={confDialog} onOpenChange={setConfDialog} />
      <div className="p-4">
        <div className="flex flex-row items-center">
          {isHost && <span className="text-xs">Host on port: {hostPort}</span>}
          <span className="flex-1"></span>
          <Button onClick={() => setConfDialog(true)}>
            <VscLink />
          </Button>
        </div>
        <Collapsible>
          <CollapsibleTrigger>Online Users</CollapsibleTrigger>
          <CollapsibleContent>TODO</CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
