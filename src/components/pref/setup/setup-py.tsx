import PrefProgram from "@/components/pref/Program"
import { Checkbox } from "@/components/ui/checkbox"
import {
  enablePythonAtom,
  pyrightsPathAtom,
  pyrightsVersionAtom,
  pythonPathAtom,
  pythonVersionAtom,
} from "@/store/setting"
import { useAtom } from "jotai"

export default function SetupPy() {
  const [enablePy, setEnablePy] = useAtom(enablePythonAtom)
  return (
    <div className="shadow-md my-2 p-4">
      <div className="flex items-center gap-2">
        <Checkbox id="enablePython" checked={enablePy} onCheckedChange={(e: boolean) => setEnablePy(e)} />
        <label className="text-sm font-medium leading-none" htmlFor="enablePython">
          Enable Python3
        </label>
      </div>
      {!enablePy ? null : (
        <>
          <PrefProgram
            leading="Python Interpreter Path"
            valueAtom={pythonPathAtom as any}
            versionAtom={pythonVersionAtom as any}
            versionFallback="File not found"
          >
            {/* <Button>Install</Button> */}
          </PrefProgram>
          <PrefProgram
            leading="Pyrights Path"
            valueAtom={pyrightsPathAtom as any}
            versionAtom={pyrightsVersionAtom as any}
            versionFallback="File not found"
          >
            {/* <Button>Install</Button> */}
          </PrefProgram>
        </>
      )}
    </div>
  )
}
