import { availableInternalChecker } from "@/lib/ipc"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useGetChecker, useSetChecker } from "@/store/tabs"

type ConfigurationProps = {
  id: number
}
export default function Configuration(props: ConfigurationProps) {
  const getChecker = useGetChecker()
  const setChecker = useSetChecker()
  const currentCheckerValue = getChecker(props.id)

  return (
    <div>
      <Select defaultValue={currentCheckerValue} onValueChange={(v: string) => setChecker(props.id, v)}>
        <SelectTrigger>
          <SelectValue placeholder="Checker" />
        </SelectTrigger>
        <SelectContent>
          {availableInternalChecker.map((ck) => (
            <SelectItem value={ck}>{ck}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
