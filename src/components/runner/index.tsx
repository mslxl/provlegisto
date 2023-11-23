import clsx from "clsx"
import { Button } from "../ui/button"
import { VscDebugRestart, VscGear } from "react-icons/vsc"
import { sourcesCode, useAddSourcecodeTestcase, useGetSourcecodeTestcase } from "@/store/tabs"
import { useAtom } from "jotai"
import { LanguageMode, compileSource, runDetach } from "@/lib/ipc"
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { motion } from "framer-motion"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import Editor from "../editor"
import { ChevronDown } from "lucide-react"
import { Badge } from "../ui/badge"
import { emit, useMitt } from "@/hooks/useMitt"
import SingleRunner from "./single"

export default function Runner({ id, className }: { id: number; className?: string }) {
  const [sourceCodeMap] = useAtom(sourcesCode)
  const [runAllAnimate, setRunAllAnimate] = useState(false)
  const addSourcecodeTestcase = useAddSourcecodeTestcase()
  const getSourcecodeTestcase = useGetSourcecodeTestcase()

  async function runAll() {
    setRunAllAnimate(true)
    const sourceCode = sourceCodeMap.get(id)!
    console.log(await compileSource(LanguageMode.CXX, sourceCode))
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
    const sourceCode = sourceCodeMap.get(id)!
    let target = await compileSource(LanguageMode.CXX, sourceCode)
    setRunAllAnimate(false)

    if (target.type === "Success") {
      runDetach(target.data)
    } else {
      console.log(target)
    }
  }

  if (id == -1) {
    return <div></div>
  }

  const testcaseList = getSourcecodeTestcase(id).map((_, index) => <SingleRunner id={id} testcaseIdx={index} />)

  return (
    <div className={clsx(className, "h-full select-none flex flex-col min-h-0 min-w-0")}>
      <div className="flex-1 min-h-0">
        <div className="m-1 text-end min-w-0">
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
          <Button size="icon" variant="outline" className="m-1">
            <VscGear />
          </Button>
        </div>
        <div className="min-w-0">
          <Accordion type="multiple">{testcaseList}</Accordion>
        </div>
      </div>
      <div className="flex gap-2 p-4 shadow-md shadow-black">
        <Button size="sm" className="flex-1 py-0" onClick={() => addSourcecodeTestcase(id)}>
          New Case
        </Button>
        <Button size="sm" className="flex-1 py-0" onClick={() => emit("run", "all")}>
          Run All
        </Button>
      </div>
    </div>
  )
}
