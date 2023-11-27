import { forwardRef, useEffect, useRef, useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import {  useDelTestcase, useGetChecker, useGetSourcesCode, useGetTestcase, useSetTestcase } from "@/store/tabs"
import { emit, useMitt } from "@/hooks/useMitt"
import { LanguageMode, compileRunCheck } from "@/lib/ipc"
import { Button } from "../ui/button"
import { VscDebugRestart, VscTrash } from "react-icons/vsc"
import { useTauriEvent } from "@/hooks/useTauriEvent"
import { motion } from "framer-motion"
import clsx from "clsx"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import AdditionMessage from "./addition-msg"
type SingleRunnerProps = {
  id: number
  testcaseIdx: number
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

export default function SingleRunner(props : SingleRunnerProps) {
  const getSourcecodeTestcase = useGetTestcase()
  const setSourcecodeTestcase = useSetTestcase()
  const delSourcecodeTestcase = useDelTestcase()
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("UK")

  let testcase = getSourcecodeTestcase(props.id)[props.testcaseIdx]
  const sourceCode = useGetSourcesCode()(props.id)
  const externalTaskId = `${props.id}_${props.testcaseIdx}`
  const acutalStdoutBuf = useRef("")
  const acutalStdoutLinesCnt = useRef(0)
  const [actualStdout, setActualStdout] = useState("")
  const acutalStderrBuf = useRef("")
  const [actualStderr, setActualStderr] = useState("")
  const [running, setRunning] = useState(false)
  const checker = useGetChecker()(props.id)
  const [checkerReport, setCheckerReport] = useState("")

  useEffect(()=>{
    setJudgeStatus('UK')
  }, [props.id])

  useMitt(
    "run",
    (taskId) => {
      if (props.testcaseIdx != parseInt(taskId) && taskId != "all") return
      setRunning(true)
      setJudgeStatus("PD")
      acutalStdoutBuf.current = ""
      acutalStderrBuf.current = ""
      acutalStdoutLinesCnt.current = 0
      setActualStderr("")
      setActualStdout("")

      compileRunCheck(LanguageMode.CXX, sourceCode, externalTaskId, testcase.input, testcase.output, {
        type: "Internal",
        name: checker,
      })
        .then((result) => {
          console.log(result)
          if (result.type == "WA") {
            setCheckerReport(result.report)
          } else if(result.type == 'CE') {
            let line = ""
            for(let i of result.data){
              line += `${i.ty} ${i.position[0]}:${i.position[1]} ${i.description}\n`
            }
            setCheckerReport(line)
          }
          
          setRunning(false)
          setJudgeStatus(result.type as any)
        })
        .catch((e) => {
          console.error(e)
          setRunning(false)
        })
    },
    [props.testcaseIdx, props.id, testcase, sourceCode, checker],
  )
  useTauriEvent(
    externalTaskId,
    (event) => {
      const payload = event.payload as any
      if (payload.type == "Clear") {
        acutalStdoutBuf.current = ""
        acutalStderrBuf.current = ""
        acutalStdoutLinesCnt.current = 0
      } else if (payload.type == "AppendStdout") {
        acutalStdoutLinesCnt.current += 1
        if (acutalStdoutLinesCnt.current > 200) {
          setActualStdout(acutalStdoutBuf.current + "...")
        } else {
          acutalStdoutBuf.current = acutalStdoutBuf.current + payload.line
          setActualStdout(acutalStdoutBuf.current)
        }
      } else if (payload.type == "AppendStderr") {
        acutalStderrBuf.current = acutalStderrBuf.current + payload.line
        setActualStderr(acutalStdoutBuf.current)
      }
    },
    [externalTaskId],
  )

  return (
    <AccordionItem
      value={props.testcaseIdx.toString()}
      className={clsx("border-l-4", JudgeStatusBorderStyle[judgeStatus])}
    >
      <AccordionTrigger className="px-1 py-1" asChild>
        <div className="flex">
          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" />
          <h3 className="text-sm whitespace-nowrap">
            Testcase #{props.testcaseIdx}
            <Badge className={clsx("mx-2 text-white", JudgeStatusTextStype[judgeStatus])}>{judgeStatus}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                emit("run", props.testcaseIdx.toString())
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
                delSourcecodeTestcase(props.id, props.testcaseIdx)
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
        <Editor
          kernel="codemirror"
          className="min-w-0 m-2"
          text={testcase.input}
          onChange={(v) => setSourcecodeTestcase(props.id, props.testcaseIdx, v, undefined)}
        />
        <span className="text-sm px-2">Expected Output:</span>
        <Editor
          kernel="codemirror"
          className="min-w-0 m-2"
          text={testcase.output}
          onChange={(v) => setSourcecodeTestcase(props.id, props.testcaseIdx, undefined, v)}
        />
        <span className="text-sm px-2">Ouput:</span>
        <Editor kernel="codemirror" className="min-w-0 m-2" text={actualStdout} />
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
