import { docProviderStateAtom } from "@/store/source/provider"
import { useAtomValue } from "jotai"
import Unconnect from "./unconnect"
import Connecting from "./connecting"
import Connected from "./connected"

interface CollabPanelProps {
  className?: string
}

export default function CollabPanel(props: CollabPanelProps) {
  const connectedStatus = useAtomValue(docProviderStateAtom)

  if (connectedStatus == "unconnected") {
    return <Unconnect className={props.className} />
  }
  if (connectedStatus == "connecting") {
    return <Connecting className={props.className} />
  }
  if (connectedStatus == "connected") {
    return <Connected className={props.className}/>
  }
}
