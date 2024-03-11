import { availableInternalChecker } from "@/lib/ipc"
import PrefSelect from "../pref/Select"
import { Source } from "@/store/source/model"
import { PrefNumber } from "../pref/Number"

type ConfigurationProps = {
  source: Source
}
export default function TestConfiguration({ source }: ConfigurationProps) {
  const checker = source.useChecker()
  const timelimits = source.useTimelimit()

  return (
    <div>
      <PrefSelect
        leading="Checker"
        items={availableInternalChecker.map((v) => ({ key: v, value: v }))}
        value={checker!}
        onChange={(v) => (source.checker = v)}
      />
      <PrefNumber
        leading="Time Limits"
        min={0}
        step={500}
        value={timelimits}
        onChange={(v) => (source.timelimit = v)}
      />
    </div>
  )
}
