import clsx from "clsx"
import { Button } from "../ui/button"
import { VscDebugRestart, VscGear } from "react-icons/vsc"
import { compileSource, runDetach } from "@/lib/ipc"
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { Accordion } from "../ui/accordion"
import { emit, useMitt } from "@/hooks/useMitt"
import SingleRunner from "./single"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import Configuration from "./conf"
import * as log from "tauri-plugin-log-api"
import { Atom, useAtom, useAtomValue } from "jotai"
import { activeIdAtom, sourceStoreAtom } from "@/store/source"
import { focusAtom } from "jotai-optics"
import { splitAtom } from "jotai/utils"
import { emptyTestcase } from "@/store/testcase"
import useReadAtom from "@/hooks/useReadAtom"

export default function Runnner({ className }: { className?: string }) {
  const activeId = useAtomValue(activeIdAtom)
  if (activeId == -1) {
    return <div className={className}></div>
  }
  return <RunnerContent className={className} activeIdAtom={activeIdAtom} />
}

function RunnerContent(props: { className?: string; activeIdAtom: Atom<number> }) {
  const activeId = useAtomValue(props.activeIdAtom)
  const sourceCodeAtom = useMemo(
    () => focusAtom(sourceStoreAtom, (optic) => optic.prop(activeId).prop("code")),
    [activeId],
  )
  const readSourceCode = useReadAtom(sourceCodeAtom)

  const testAtom = useMemo(() => focusAtom(sourceStoreAtom, (optic) => optic.prop(activeId).prop("test")), [activeId])
  const testcasesAtom = useMemo(() => splitAtom(focusAtom(testAtom, (optic) => optic.prop("testcases"))), [testAtom])
  const timeLimitsAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("timeLimits")), [testAtom])
  const memoryAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("memoryLimits")), [testAtom])
  const checkerAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("checker")), [testAtom])

  const [testcases, dispatchTestcases] = useAtom(testcasesAtom)

  const [runAllAnimate, setRunAllAnimate] = useState(false)

  async function runAll() {
    setRunAllAnimate(true)
    const sourceCode = readSourceCode()
    await compileSource(sourceCode.language, sourceCode.source)
    setRunAllAnimate(false)
  }

  useMitt(
    "run",
    (target) => {
      if (target == "all") runAll()
    },
    [runAll],
  )

  async function onRunDetachClick() {
    setRunAllAnimate(true)
    const sourceCode = readSourceCode()
    let target = await compileSource(sourceCode.language, sourceCode.source)
    setRunAllAnimate(false)

    if (target.type === "Success") {
      runDetach(target.data)
    } else {
      log.warn(JSON.stringify(target))
    }
  }

  if (activeId == -1) {
    return <div>TODO</div>
  }

  const testcaseList = testcases.map((atom, index) => (
    <SingleRunner
      key={index}
      sourceAtom={sourceCodeAtom}
      testcaseAtom={atom}
      onDelete={() => dispatchTestcases({ type: "remove", atom })}
      taskId={index.toString()}
      checkerAtom={checkerAtom}
      timeLimitsAtom={timeLimitsAtom}
      memoryLimitsAtom={memoryAtom}
    />
  ))

  return (
    <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")}>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="m-1 text-end min-w-0 shadow-sm">
          <ContextMenu>
            <ContextMenuTrigger>
              <Button
                size="icon"
                variant="outline"
                className="m-1 bg-green-600 hover:bg-green-500"
                onClick={() => emit("run", "all")}
              >
                <motion.span
                  className="p-0 m-0"
                  animate={{ rotate: runAllAnimate ? [0, -360] : [] }}
                  transition={{ ease: "linear", duration: 1, repeat: Infinity, repeatDelay: 0, repeatType: "loop" }}
                >
                  <VscDebugRestart className="text-white" />
                </motion.span>
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={onRunDetachClick}>Run Detached</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline" className="m-1">
                <VscGear />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right">
              <Configuration testAtom={testAtom} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-0 min-h-0 overflow-y-auto flex-1">
          <Accordion type="multiple">{testcaseList}</Accordion>
        </div>
      </div>
      <div className="flex gap-2 p-4 shadow-sm shadow-black">
        <Button
          size="sm"
          className="flex-1 py-0  bg-green-600 hover:bg-green-500"
          onClick={() => dispatchTestcases({ type: "insert", value: emptyTestcase() })}
        >
          New Testcase
        </Button>
        <Button size="sm" className="flex-1 py-0 bg-blue-500 hover:bg-blue-400">
          Submit
        </Button>
      </div>
    </div>
  )
}
