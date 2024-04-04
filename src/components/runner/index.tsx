import clsx from "clsx"
import { Button } from "../ui/button"
import { VscDebugRestart, VscGear } from "react-icons/vsc"
import { compileSource, runDetach } from "@/lib/ipc"
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { motion } from "framer-motion"
import { useState } from "react"
import { Accordion } from "../ui/accordion"
import { emit, useMitt } from "@/lib/hooks/useMitt"
import SingleRunner from "./single"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import * as log from "tauri-plugin-log-api"
import useGetLanguageCompiler from "@/lib/hooks/useGetLanguageCompiler"
import EmptyRunner from "./empty"
import { Source } from "@/store/source/model"
import TestConfiguration from "./conf"

interface RunnerProps {
  className?: string
  source: Source | null
}

export default function RunnerPanel({ className, source }: RunnerProps) {
  if (!source) {
    return <EmptyRunner className={className} />
  }
  return <RunnerContent className={className} source={source} />
}

interface RunnerContent {
  className?: string
  source: Source
}

function RunnerContent(props: RunnerContent) {
  const [runAllAnimate, setRunAllAnimate] = useState(false)
  const checker = props.source.useChecker()
  const tests = props.source.useTests()
  const getLanguageCompilerPath = useGetLanguageCompiler()

  async function runAll() {
    setRunAllAnimate(true)
    const sourceCode = props.source.source.toString()
    await compileSource(props.source.language, sourceCode, {
      path: (await getLanguageCompilerPath(props.source.language)) ?? undefined,
      args: [],
    })
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
    const sourceCode = props.source.source.toString()
    let target = await compileSource(props.source.language, sourceCode, {
      path: (await getLanguageCompilerPath(props.source.language)) ?? undefined,
    })
    setRunAllAnimate(false)

    if (target.type === "Success") {
      runDetach(target.data, props.source.language)
    } else {
      log.warn(JSON.stringify(target))
    }
  }

  const testsComponent = tests.map((test, index) => (
    <SingleRunner
    name={`# ${index + 1}`}
      key={test.id}
      testcase={test}
      source={props.source}
      checker={checker ?? "wcmp"}
      onDelete={() => {
        props.source.deleteTest(index)
      }}
    />
  ))

  return (
    <div className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0")}>
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto ">
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
              <TestConfiguration source={props.source} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-0 min-h-0 flex-1">
          <Accordion type="multiple">{testsComponent}</Accordion>
        </div>
      </div>
      <div className="flex gap-2 p-4 shadow-sm shadow-black">
        <Button
          size="sm"
          className="flex-1 py-0  bg-green-600 hover:bg-green-500"
          onClick={() => props.source.pushEmptyTest()}
        >
          New Testcase
        </Button>
        {/* <Button size="sm" className="flex-1 py-0 bg-blue-500 hover:bg-blue-400">
          Submit
        </Button> */}
      </div>
    </div>
  )
}
