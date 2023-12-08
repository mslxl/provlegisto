import { useEffect, useMemo, useRef, useState } from "react"
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
import { Atom, PrimitiveAtom, useAtom } from "jotai"
import { TestCase } from "@/store/testcase"
import { SourceCode } from "@/store/source"
import useReadAtom from "@/hooks/useReadAtom"
import { focusAtom } from "jotai-optics"
import useGetLanguageCompiler from "@/hooks/useGetLanguageCompiler"
type SingleRunnerProps = {
  testcaseAtom: PrimitiveAtom<TestCase>
  sourceAtom: Atom<SourceCode>
  timeLimitsAtom: Atom<number>
  memoryLimitsAtom: Atom<number>
  checkerAtom: Atom<string>
  id: number
  taskId: string
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

const JudgeStatusTextStype: JudgeStatusStyle = {
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
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("UK")

  const readSourceCode = useReadAtom(props.sourceAtom)
  const readTimeLimits = useReadAtom(props.timeLimitsAtom)
  // const readMemoryLimits = useReadAtom(props.memoryLimitsAtom)
  const readChecker = useReadAtom(props.checkerAtom)
  const inputAtom = useMemo(() => focusAtom(props.testcaseAtom, (optic) => optic.prop("input")), [props.testcaseAtom])
  const outputAtom = useMemo(() => focusAtom(props.testcaseAtom, (optic) => optic.prop("output")), [props.testcaseAtom])

  const [input, setInputAtom] = useAtom(inputAtom)
  const [output, setOutputAtom] = useAtom(outputAtom)

  function setInput(inp: string){
    setInputAtom(inp)
    emit('cache', props.id)
  }
  function setOutput(oup: string){
    setOutputAtom(oup)
    emit('cache', props.id)
  }

  const [actualStdout, setActualStdout] = useState("")
  const [actualStderr, setActualStderr] = useState("")
  const acutalStdoutLinesCnt = useRef(0)
  const [running, setRunning] = useState(false)
  const [checkerReport, setCheckerReport] = useState("")
  const getLanguageCompiler = useGetLanguageCompiler()

  useEffect(() => {
    setJudgeStatus("UK")
    setCheckerReport("")
    setActualStderr("")
    setActualStdout("")
  }, [props.sourceAtom])

  useMitt(
    "run",
    async (taskId) => {
      if (props.taskId != taskId && taskId != "all") return
      setRunning(true)
      setJudgeStatus("PD")
      acutalStdoutLinesCnt.current = 0
      setCheckerReport("")
      setActualStderr("")
      setActualStdout("")

      const sourceCode = readSourceCode()

      const checker = readChecker()
      log.info(`compile in ${sourceCode.language} mode with checker ${checker}`)

      compileRunCheck(
        sourceCode.language,
        sourceCode.source,
        props.taskId,
        input,
        output,
        {
          type: "Internal",
          name: checker,
        },
        readTimeLimits(),
        {
          path: (await getLanguageCompiler(sourceCode.language)) ?? undefined,
        },
      )
        .then((result) => {
          log.info(JSON.stringify(result))

          if (result.type == "WA") {
            setCheckerReport(result.report)
          } else if (result.type == "CE") {
            let line = ""
            for (let i of result.data) {
              line += `${i.ty} ${i.position[0]}:${i.position[1]} ${i.description}\n`
            }
            setCheckerReport(line)
          } else {
            setCheckerReport(" ")
          }

          setRunning(false)
          setJudgeStatus(result.type as any)
        })
        .catch((e) => {
          console.error(e)
          setRunning(false)
        })
    },
    [props.taskId, props.sourceAtom, input, output],
  )
  useTauriEvent(
    props.taskId,
    (event) => {
      const payload = event.payload as any
      if (payload.type == "Clear") {
        acutalStdoutLinesCnt.current = 0
      } else if (payload.type == "AppendStdout") {
        acutalStdoutLinesCnt.current += 1
        if (acutalStdoutLinesCnt.current > 200) {
          setActualStdout((prev) => prev + "...")
        } else {
          setActualStdout((prev) => prev + payload.line)
        }
      } else if (payload.type == "AppendStderr") {
        setActualStderr((prev) => prev + payload.line)
      }
    },
    [props.taskId],
  )

  return (
    <AccordionItem value={props.taskId} className={clsx("border-l-4", JudgeStatusBorderStyle[judgeStatus])}>
      <AccordionTrigger className="px-1 py-1" asChild>
        <div className="flex">
          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
          <h3 className="text-sm whitespace-nowrap">
            Testcase #{props.taskId}
            <Badge className={clsx("mx-2 text-white", JudgeStatusTextStype[judgeStatus])}>{judgeStatus}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                emit("run", props.taskId)
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
        <Editor kernel="codemirror" className="min-w-0 m-2" text={input} onChange={setInput} editable/>
        <span className="text-sm px-2">Expected Output:</span>
        <Editor kernel="codemirror" className="min-w-0 m-2" text={output} onChange={setOutput} editable/>
        <span className="text-sm px-2">Ouput:</span>
        <Editor kernel="codemirror" className="min-w-0 m-2" text={actualStdout} editable={false} />
        <Popover>
          <PopoverTrigger asChild>
            <span className="text-end text-xs w-full px-2 hover:text-gray-600">See Report&gt;&gt;</span>
          </PopoverTrigger>
          <PopoverContent side="right">
            <AdditionMessage checkReport={checkerReport} stderrLog={actualStderr} />
          </PopoverContent>
        </Popover>
      </AccordionContent>
    </AccordionItem>
  )
}
