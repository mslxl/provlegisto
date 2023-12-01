import { availableInternalChecker } from "@/lib/ipc"
import { PrimitiveAtom } from "jotai"
import { Test } from "@/store/testcase"
import { useMemo } from "react"
import { focusAtom } from "jotai-optics"
import PrefSelect from "../pref/Select"
import { PrefNumber } from "../pref"

type ConfigurationProps = {
  testAtom: PrimitiveAtom<Test>
}
export default function Configuration(props: ConfigurationProps) {
  const checkerAtom = useMemo(() => focusAtom(props.testAtom, (optic) => optic.prop("checker")), [props.testAtom])
  const timeLimitsAtom = useMemo(() => focusAtom(props.testAtom, (optic) => optic.prop("timeLimits")), [props.testAtom])

  return (
    <div>
      <PrefSelect
        leading="Checker"
        items={availableInternalChecker.map((v) => ({ key: v, value: v }))}
        atom={checkerAtom}
      />
      <PrefNumber leading="Time Limits" min={0} step={500} atom={timeLimitsAtom} />
    </div>
  )
}
