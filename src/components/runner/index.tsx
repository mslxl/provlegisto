import clsx from "clsx"
import { Button } from "../ui/button"
import { VscDebugRestart, VscGear } from "react-icons/vsc"
import { sourcesCode } from "@/store/tabs"
import { useAtom } from "jotai"
import { LanguageMode, compileSource, runDetach } from "@/lib/ipc"
import { ContextMenu, ContextMenuItem, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import Editor from "../editor"

export default function Runner({ id, className }: { id: number; className?: string }) {
  const [sourceCodeMap] = useAtom(sourcesCode)
  async function runAll() {
    const sourceCode = sourceCodeMap.get(id)!
    console.log(await compileSource(LanguageMode.CXX, sourceCode))
  }

  async function onRunDetachClick() {
    const sourceCode = sourceCodeMap.get(id)!
    let target = await compileSource(LanguageMode.CXX, sourceCode)
    if (target.type === "Success") {
      runDetach(target.data)
    } else {
      console.log(target)
    }
  }

  if (id == -1) {
    return <div></div>
  }
  return (
    <div className={clsx(className, "h-full select-none")}>
      <div className="m-1 text-end">
        <ContextMenu>
          <ContextMenuTrigger>
            <Button size="sm" variant="outline" className="m-1 bg-green-600 hover:bg-green-500" onClick={runAll}>
              <VscDebugRestart className="text-white" />
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={onRunDetachClick}>Run Detached</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <Button size="sm" variant="outline" className="m-1">
          <VscGear />
        </Button>
      </div>
      <div>
        <Editor kernel="codemirror" />
      </div>
    </div>
  )
}
