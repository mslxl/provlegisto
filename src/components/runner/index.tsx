import clsx from "clsx"
import { Button } from "../ui/button"
import { VscDebugRestart, VscGear } from "react-icons/vsc"
import { compileSource, runDetach } from "@/lib/ipc"
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { Accordion } from "../ui/accordion"
import { emit, useMitt } from "@/hooks/useMitt"
import SingleRunner from "./single"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import Configuration from "./conf"
import * as log from "tauri-plugin-log-api"
import { Atom, atom, useAtom, useAtomValue } from "jotai"
import { SourceId, activeIdAtom, sourceStoreAtom } from "@/store/source"
import { focusAtom } from "jotai-optics"
import { splitAtom } from "jotai/utils"
import { emptyTestcase } from "@/store/testcase"
import useReadAtom from "@/hooks/useReadAtom"
import useGetLanguageCompiler from "@/hooks/useGetLanguageCompiler"
import EmptyRunner from "./empty"
import { collabDocumentAtom } from "@/store/collab"
import { YArrayEvent } from "yjs"

export default function Runnner({ className }: { className?: string }) {
  const activeId = useAtomValue(activeIdAtom)
  const nonNullActiveIdAtom = useMemo(
    () =>
      atom(
        (get) => get(activeIdAtom)!,
        (_get, set, value: SourceId) => {
          set(activeIdAtom, value)
        },
      ),
    [activeIdAtom],
  )
  nonNullActiveIdAtom.debugLabel = "acitve id(not null)"
  if (activeId == null) {
    return <EmptyRunner className={className} />
  }
  return <RunnerContent className={className} activeIdAtom={nonNullActiveIdAtom} />
}

type RunnerContentProps = {
  className?: string
  activeIdAtom: Atom<SourceId>
}

function RunnerContent(props: RunnerContentProps) {
  const activeId = useAtomValue(props.activeIdAtom)
  const sourceCodeAtom = useMemo(
    () => focusAtom(sourceStoreAtom, (optic) => optic.prop(activeId).prop("code")),
    [activeId],
  )
  const readSourceCode = useReadAtom(sourceCodeAtom)

  const testAtom = useMemo(() => focusAtom(sourceStoreAtom, (optic) => optic.prop(activeId).prop("test")), [activeId])
  const testcasesAtomsAtom = useMemo(
    () => splitAtom(focusAtom(testAtom, (optic) => optic.prop("testcases"))),
    [testAtom],
  )
  const timeLimitsAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("timeLimits")), [testAtom])
  const memoryAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("memoryLimits")), [testAtom])
  const checkerAtom = useMemo(() => focusAtom(testAtom, (optic) => optic.prop("checker")), [testAtom])

  const [testcasesAtoms, dispatchTestcasesAtoms] = useAtom(testcasesAtomsAtom)

  const [runAllAnimate, setRunAllAnimate] = useState(false)

  const getLanguageCompilerPath = useGetLanguageCompiler()

  async function runAll() {
    setRunAllAnimate(true)
    const sourceCode = readSourceCode()
    await compileSource(sourceCode.language, sourceCode.source, {
      path: (await getLanguageCompilerPath(sourceCode.language)) ?? undefined,
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
    const sourceCode = readSourceCode()
    let target = await compileSource(sourceCode.language, sourceCode.source, {
      path: (await getLanguageCompilerPath(sourceCode.language)) ?? undefined,
    })
    setRunAllAnimate(false)

    if (target.type === "Success") {
      runDetach(target.data, sourceCode.language)
    } else {
      log.warn(JSON.stringify(target))
    }
  }

  // sync testcase with remote
  const collabDocument = useAtomValue(collabDocumentAtom)
  const tests = useAtomValue(testAtom)
  const testcasesAtom = useMemo(() => focusAtom(testAtom, (optics) => optics.prop("testcases")), [testAtom])
  const [testcases, _setTestcases] = useAtom(testcasesAtom)
  const testcaseListRemote = useMemo(() => collabDocument.getArray<string>(`testcase-array-${activeId}`), [activeId])
  useEffect(() => {
    let remoteTestcaseSet = new Set([...testcaseListRemote.toArray()])
    let remoteLackId = tests.testcases.filter((item) => !remoteTestcaseSet.has(item.id)).map((item) => item.id)
    if (remoteLackId.length > 0) {
      testcaseListRemote.push(remoteLackId)
    }
  }, [activeId, testcasesAtoms])

  useEffect(() => {
    function observer(ty: YArrayEvent<string>) {
      let changes = ty.changes.delta
      let existsTestcase = new Set([...testcases.map((item) => item.id)])
      changes
        .filter((item) => item.insert)
        .map((item) => item.insert)
        .flat()
        .filter((id) => !existsTestcase.has(id))
        .forEach((id) => {
          dispatchTestcasesAtoms({ type: "insert", value: { input: "", output: "", id } })
        })
      //TODO
      let toRemove = changes.filter((item) => item.delete).map((item) => item.delete)
      console.log(toRemove)
    }

    testcaseListRemote.observe(observer)
    return () => testcaseListRemote.unobserve(observer)
  }, [activeId, testcaseListRemote, testcases])

  const testcaseList = testcasesAtoms.map((atom, index) => (
    <SingleRunner
      key={index}
      id={activeId}
      sourceAtom={sourceCodeAtom}
      testcaseAtom={atom}
      onDelete={(uuid) => {
        testcaseListRemote.delete(testcaseListRemote.toArray().indexOf(uuid))
        dispatchTestcasesAtoms({ type: "remove", atom })
      }}
      taskId={index.toString()}
      checkerAtom={checkerAtom}
      timeLimitsAtom={timeLimitsAtom}
      memoryLimitsAtom={memoryAtom}
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
              <Configuration testAtom={testAtom} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="min-w-0 min-h-0 flex-1">
          <Accordion type="multiple">{testcaseList}</Accordion>
        </div>
      </div>
      <div className="flex gap-2 p-4 shadow-sm shadow-black">
        <Button
          size="sm"
          className="flex-1 py-0  bg-green-600 hover:bg-green-500"
          onClick={() => dispatchTestcasesAtoms({ type: "insert", value: emptyTestcase() })}
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
