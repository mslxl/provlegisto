import { forwardRef, useState } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import { useAtomSourceCodeMap, useGetSourcecodeTestcase, useSetSourcecodeTestcase } from "@/store/tabs"
import { emit, useMitt } from "@/hooks/useMitt"
import { LanguageMode, compileSource, runRedirect } from "@/lib/ipc"
import { Button } from "../ui/button"
import { VscDebugRestart } from "react-icons/vsc"
type SingleRunnerProps = {
  id: number
  testcaseIdx: number
}

type JudgeStatus = "AC" | "TLE" | "WA" | "RE" | "PD" | "CE"

const SingleRunner = forwardRef<unknown, SingleRunnerProps>((props, ref) => {
  const getSourcecodeTestcase = useGetSourcecodeTestcase()
  let testcase = getSourcecodeTestcase(props.id)[props.testcaseIdx]
  const setSourceCodeTestcase = useSetSourcecodeTestcase()
  const sourceCode = useAtomSourceCodeMap().get(props.id)!
  const [judgeStatus, setJudgeStatus] = useState<JudgeStatus>("PD")

  const externalTaskId = `task${props.id}_${props.testcaseIdx}`

  useMitt(
    "run",
    (taskId) => {
      if (props.testcaseIdx != parseInt(taskId) && taskId != "all") return
      compileSource(LanguageMode.CXX, sourceCode).then((compileResult) => {
        if (compileResult.type == "Error") {
          setJudgeStatus("CE")
          return
        }
        const target = compileResult.data
        runRedirect(LanguageMode.CXX, externalTaskId, target, testcase.input).then((judgeResult) => {
          console.log(judgeResult)
          setJudgeStatus(judgeResult.type as any)
        })
      })
    },
    [props.testcaseIdx, props.id, testcase, sourceCode],
  )

  return (
    <AccordionItem value={props.testcaseIdx.toString()}>
      <AccordionTrigger className="px-4 py-1" asChild>
        <div className="flex">
          <h3>
            Testcase #{props.testcaseIdx}
            <Badge className="m-2">{judgeStatus}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                emit("run", props.testcaseIdx.toString())
                e.preventDefault()
              }}
              variant="outline"
            >
              <VscDebugRestart />
            </Button>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Editor
          kernel="codemirror"
          className="min-w-0 m-2"
          text={testcase.input}
          onChange={(v) => setSourceCodeTestcase(props.id, props.testcaseIdx, v, undefined)}
        />
        <Editor
          kernel="codemirror"
          className="min-w-0 m-2"
          text={testcase.output}
          onChange={(v) => setSourceCodeTestcase(props.id, props.testcaseIdx, undefined, v)}
        />
      </AccordionContent>
    </AccordionItem>
  )
})
SingleRunner.displayName = "SingleRunner"
export default SingleRunner
