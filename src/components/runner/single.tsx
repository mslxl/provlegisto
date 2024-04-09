import { useRef, useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import { emit, useMitt } from "@/lib/hooks/useMitt"
import { compileRunCheck } from "@/lib/ipc"
import { Button } from "../ui/button"
import { VscDebugRestart, VscTrash } from "react-icons/vsc"
import { useTauriEvent } from "@/lib/hooks/useTauriEvent"
import { motion } from "framer-motion"
import clsx from "clsx"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import AdditionMessage from "./addition-msg"
import * as log from "tauri-plugin-log-api"
import { JudgeStatus, Source, Testcase } from "@/store/source/model"
import useGetLanguageCompiler from "@/lib/hooks/useGetLanguageCompiler"
import useDebounceBuffer from "@/lib/hooks/useDebounceBuffer"
type SingleRunnerProps = {
  name?: string,
  testcase: Testcase
  source: Source
  checker: string
  onDelete: () => void
}

type JudgeStatusStyle = {
  [Property in keyof typeof JudgeStatus]: string
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
  UKE: "bg-violet-600",
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
  UKE: "bg-violet-600",
}

export default function SingleRunner(props: SingleRunnerProps) {
  const [running, setRunning] = useState(false)
  const stdoutLineCount = useRef(0)
  const getLanguageCompiler = useGetLanguageCompiler()

  const setTestcaseStdOutDebounced = useDebounceBuffer("", 500, (v) => (props.testcase.stdout = v), [props.testcase])
  const setTestcaseStdErrDebounced = useDebounceBuffer("", 500, (v) => (props.testcase.stderr = v), [props.testcase])
  const setTestcaseReportDebounced = useDebounceBuffer("", 500, (v) => (props.testcase.report = v), [props.testcase])

  useMitt(
    "run",
    async (taskId) => {
      if (props.testcase.id != taskId && taskId != "all") return
      setRunning(true)
      const testcases = props.testcase
      testcases.status = JudgeStatus.PD
      setTestcaseStdErrDebounced(() => "")
      setTestcaseStdOutDebounced(() => "")
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
          // update UI
          log.info(JSON.stringify(result))
          if (result.type == "WA") {
            // redirect checker error message to report
            setTestcaseReportDebounced(() => result.report)
          } else if (result.type == "CE") {
            // redirect compiler error message to report
            setTestcaseReportDebounced(() => "")
            for (let i of result.data) {
              setTestcaseReportDebounced((v) => v + `${i.ty} ${i.position[0]}:${i.position[1]} ${i.description}\n`)
            }
          } else {
            // compile succeed, clear report
            setTestcaseReportDebounced(() => "")
          }
          setRunning(false)
          if (JudgeStatus[result.type] != undefined) {
            testcases.status = JudgeStatus[result.type]
          } else {
            testcases.status = JudgeStatus.UKE
          }
        })
        .catch((e) => {
          setTestcaseReportDebounced(() => `Internal Error: ${e.toString()}`)
          console.error(e)
          setRunning(false)
        })
    },
    [props.testcase, props.testcase.id],
  )

  // redirect stdout and stderr
  useTauriEvent(
    props.testcase.id,
    (event) => {
      const payload = event.payload as any
      const testcase = props.testcase
      if (payload.type == "Clear") {
        // clear stdout
        setTestcaseStdOutDebounced(() => "")
        setTestcaseStdErrDebounced(() => "")
        stdoutLineCount.current = 0
      } else if (payload.type == "AppendStdout") {
        stdoutLineCount.current += 1

        if (stdoutLineCount.current == 200) {
          testcase.stdout += "..."
        } else if (stdoutLineCount.current < 200) {
          setTestcaseStdOutDebounced((old) => old + payload.line)
        }
      } else if (payload.type == "AppendStderr") {
        setTestcaseStdErrDebounced((old) => old + payload.line)
      }
    },
    [props.testcase, props.testcase.id],
  )

  const judgeStatus = props.testcase.useStatus()

  const stdout = props.testcase.useStdout()
  const stderr = props.testcase.useStderr()
  const report = props.testcase.useReport()

  return (
    <AccordionItem
      value={props.testcase.id}
      className={clsx("border-l-4", JudgeStatusBorderStyle[JudgeStatus[judgeStatus] as keyof typeof JudgeStatus])}
    >
      <AccordionTrigger className="px-1 py-1" asChild>
        <div className="flex">
          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
          <span className="flex-1">{props.name}</span>
          <h3 className="text-sm whitespace-nowrap">
            <Badge
              className={clsx(
                "mx-2 text-white",
                JudgeStatusTextStyle[JudgeStatus[judgeStatus] as keyof typeof JudgeStatus],
              )}
            >
              {JudgeStatus[judgeStatus]}
            </Badge>
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
        <Editor className="min-w-0 p-2" text={props.testcase.input} />
        <span className="text-sm px-2">Expected Output:</span>
        <Editor className="min-w-0 p-2" text={props.testcase.except} />
        <span className="text-sm px-2">Ouput:</span>
        <Editor className="min-w-0 p-2" text={stdout} />
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
