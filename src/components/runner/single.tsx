import { forwardRef, useRef, useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import {
  useAtomSourceCodeMap,
  useDelSourcecodeTestcase,
  useGetSourcecodeTestcase,
  useSetSourcecodeTestcase,
} from "@/store/tabs"
import { emit, useMitt } from "@/hooks/useMitt"
import { LanguageMode, compileSource, runRedirect } from "@/lib/ipc"
import { Button } from "../ui/button"
import { VscDebugRestart, VscTrash } from "react-icons/vsc"
import { useTauriEvent } from "@/hooks/useTauriEvent"
import { motion } from "framer-motion"
import clsx from "clsx"
type SingleRunnerProps = {
  id: number
  testcaseIdx: number
}

type JudgeStatus = "AC" | "TLE" | "WA" | "RE" | "PD" | "CE" | "UK"

type JudgeStatusStyle = {
  [Property in JudgeStatus] : string
}

const JudgeStatusBorderStyle: JudgeStatusStyle = {
  'AC': 'border-l-emerald-400',
  'TLE': 'border-l-blue-600',
  'WA': 'border-l-red-700',
  'RE': 'border-l-violet-600',
  'PD': 'border-l-transparent',
  'CE': 'border-l-amber-500',
  'UK': 'border-l-transparent'
}

const JudgeStatusTextStype : JudgeStatusStyle= {
  'AC': 'bg-emerald-400',
  'TLE': 'bg-blue-600',
  'WA': 'bg-red-700',
  'RE': 'bg-violet-600',
  'PD': 'bg-slate-600',
  'CE': 'bg-amber-500',
  'UK': 'bg-slate-600'
}


const SingleRunner = forwardRef<unknown, SingleRunnerProps>((props, _ref) => {
  const getSourcecodeTestcase = useGetSourcecodeTestcase()
  const setSourcecodeTestcase = useSetSourcecodeTestcase()
  const delSourcecodeTestcase = useDelSourcecodeTestcase()
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("UK")

  let testcase = getSourcecodeTestcase(props.id)[props.testcaseIdx]
  const sourceCode = useAtomSourceCodeMap().get(props.id)!
  const externalTaskId = `task${props.id}_${props.testcaseIdx}`
  const acutalStdoutBuf = useRef("")
  const acutalStdoutLinesCnt = useRef(0)
  const [actualStdout, setActualStdout] = useState("")
  const acutalStderrBuf = useRef("")
  const [_actualStderr, setActualStderr] = useState("")
  const [running, setRunning] = useState(false)

  useMitt(
    "run",
    (taskId) => {
      if (props.testcaseIdx != parseInt(taskId) && taskId != "all") return
      setRunning(true)
      setJudgeStatus("PD")
      compileSource(LanguageMode.CXX, sourceCode)
        .then((compileResult) => {
          if (compileResult.type == "Error") {
            setJudgeStatus("CE")
            setRunning(false)
            return
          }
          const target = compileResult.data
          runRedirect(LanguageMode.CXX, externalTaskId, target, testcase.input)
            .then((judgeResult) => {
              console.log(judgeResult)
              setJudgeStatus(judgeResult.type as any)
              setRunning(false)
            })
            .catch(() => {
              setRunning(false)
            })
        })
        .catch(() => {
          setRunning(false)
        })
    },
    [props.testcaseIdx, props.id, testcase, sourceCode],
  )
  useTauriEvent(
    externalTaskId,
    (event) => {
      const payload = event.payload as any
      if (payload.type == "Clear") {
        acutalStdoutBuf.current = ""
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
    [],
  )


  return (
    <AccordionItem value={props.testcaseIdx.toString()} className={clsx("border-l-4", JudgeStatusBorderStyle[judgeStatus])}>
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
      </AccordionContent>
    </AccordionItem>
  )
})
SingleRunner.displayName = "SingleRunner"
export default SingleRunner
