import { forwardRef } from "react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ChevronDown } from "lucide-react"
import Editor from "../editor"
import { useGetSourcecodeTestcase, useSetSourcecodeTestcase } from "@/store/tabs"
type SingleRunnerProps = {
  id: number
  testcaseIdx: number
}
const SingleRunner = forwardRef<unknown, SingleRunnerProps>((props, ref) => {
  const getSourcecodeTestcase = useGetSourcecodeTestcase()
  let testcase = getSourcecodeTestcase(props.id)[props.testcaseIdx]
  const setSourceCodeTestcase = useSetSourcecodeTestcase()
  return (
    <AccordionItem value={props.testcaseIdx.toString()}>
      <AccordionTrigger className="px-4 py-1" asChild>
        <div className="flex">
          <h3>
            Testcase #{props.testcaseIdx}
            <Badge className="m-2">IDK</Badge>
          </h3>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
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
