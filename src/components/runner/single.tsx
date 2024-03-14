import { useRef, useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import { emit, useMitt } from "@/hooks/useMitt"
import { compileRunCheck } from "@/lib/ipc"
import { Button } from "../ui/button"
import { VscDebugRestart, VscTrash } from "react-icons/vsc"
import { useTauriEvent } from "@/hooks/useTauriEvent"
import { motion } from "framer-motion"
import clsx from "clsx"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import AdditionMessage from "./addition-msg"
import * as log from "tauri-plugin-log-api"
import { Source, Testcase } from "@/store/source/model"
import useGetLanguageCompiler from "@/hooks/useGetLanguageCompiler"

type SingleRunnerProps = {
  testcase: Testcase
  source: Source
  checker: string
  onDelete: () => void
}

type JudgeStatus = "AC" | "TLE" | "WA" | "RE" | "PD" | "CE" | "UK" | "INT"

type JudgeStatusStyle = {
  [Property in JudgeStatus]: string
}

const JudgeStatusBorderStyle: JudgeStatusStyle = {
  AC: "border-l-green-700",
  TLE: "border-l-blue-600",
  WA: "border-l-red-700",
  RE: "border-l-violet-600",
  PD: "border-l-transparent",
  CE: "border-l-amber-500",
  UK: "border-l-transparent",
  INT: "border-l-violet-600",
}

const JudgeStatusTextStyle: JudgeStatusStyle = {
  AC: "bg-green-700",
  TLE: "bg-blue-600",
  WA: "bg-red-700",
  RE: "bg-violet-600",
  PD: "bg-slate-600",
  CE: "bg-amber-500",
  UK: "bg-slate-600",
  INT: "bg-violet-600",
}

export default function SingleRunner(props: SingleRunnerProps) {
  const [running, setRunning] = useState(false)
  const stdoutLineCount = useRef(0)
  const getLanguageCompiler = useGetLanguageCompiler()

  useMitt(
    "run",
    async (taskId) => {
      if (props.testcase.id != taskId && taskId != "all") return
      setRunning(true)
      const testcases = props.testcase
      testcases.status = "PD"
      testcases.stderr = ""
      testcases.stdout = ""
      const sourceCode = props.source

      const checker = props.checker
      log.info(`compile in ${sourceCode.language} mode with checker ${checker}`)

      compileRunCheck(
        sourceCode.language,
        sourceCode.source.toString(),
        props.testcase.id,
        props.testcase.input.toString(),
        props.testcase.except.toString(),
        {
          type: "Internal",
          name: checker,
        },
        sourceCode.timelimit,
        {
          path: (await getLanguageCompiler(sourceCode.language)) ?? undefined,
        },
      )
        .then((result) => {
          log.info(JSON.stringify(result))
          if (result.type == "WA") {
            testcases.report = result.report
          } else if (result.type == "CE") {
            let line = ""
            for (let i of result.data) {
              line += `${i.ty} ${i.position[0]}:${i.position[1]} ${i.description}\n`
            }
            testcases.report = line
          } else {
            testcases.report = ""
          }
          setRunning(false)
          testcases.status = result.type
        })
        .catch((e) => {
          console.error(e)
          setRunning(false)
        })
    },
    [props.testcase, props.testcase.id],
  )

  useTauriEvent(
    props.testcase.id,
    (event) => {
      const payload = event.payload as any
      const testcase = props.testcase
      if (payload.type == "Clear") {
        testcase.stdout = ""
        stdoutLineCount.current = 0
      } else if (payload.type == "AppendStdout") {
        //TODO: 这里需要防抖，否则(网络)性能会爆炸
        stdoutLineCount.current += 1
        if (stdoutLineCount.current > 200) {
          testcase.stdout += "..."
        } else {
          testcase.stdout += payload.line
        }
      } else if (payload.type == "AppendStderr") {
        //TODO: 这里需要防抖，否则(网络)性能会爆炸
        testcase.stderr += payload.line
      }
    },
    [props.testcase, props.testcase.id],
  )
  const judgeStatus = props.testcase.useStatus() as JudgeStatus  //TODO: 需要约束一下类型，无效值设为默认

  const stdout = props.testcase.useStdout()
  const stderr = props.testcase.useStderr()
  const report = props.testcase.useReport()

  return (
    <AccordionItem value={props.testcase.id} className={clsx("border-l-4", JudgeStatusBorderStyle[judgeStatus])}>
      <AccordionTrigger className="px-1 py-1" asChild>
        <div className="flex">
          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
          <span className="flex-1"></span>
          <h3 className="text-sm whitespace-nowrap">
            <Badge className={clsx("mx-2 text-white", JudgeStatusTextStyle[judgeStatus])}>{judgeStatus}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                emit("run", props.testcase.id)
                e.preventDefault()
              }}
              variant="outline"
              className="h-7 w-7 p-0"
            >
              <motion.span
                className="p-0 m-0"
                animate={{ rotate: running ? [0, -360] : [] }}
                transition={{ ease: "linear", duration: 1, repeat: Infinity, repeatDelay: 0, repeatType: "loop" }}
              >
                <VscDebugRestart />
              </motion.span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                props.onDelete()
                e.preventDefault()
              }}
            >
              <VscTrash />
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <span className="text-sm px-2">Input:</span>
        <Editor className="min-w-0 m-2" text={props.testcase.input} />
        <span className="text-sm px-2">Expected Output:</span>
        <Editor className="min-w-0 m-2" text={props.testcase.except} />
        <span className="text-sm px-2">Ouput:</span>
        <Editor className="min-w-0 m-2" text={stdout} />
        <Popover>
          <PopoverTrigger asChild>
            <span className="text-end text-xs w-full px-2 hover:text-gray-600">See Report&gt;&gt;</span>
          </PopoverTrigger>
          <PopoverContent side="right">
            <AdditionMessage checkReport={report} stderrLog={stderr} />
          </PopoverContent>
        </Popover>
      </AccordionContent>
    </AccordionItem>
  )
}
