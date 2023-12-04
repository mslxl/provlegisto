import PrefProgram from "@/components/pref/Program"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SystemName } from "@/lib/ipc/host"
import { clangdPathAtom, clangdVersionAtom, enableCxxAtom, gccPathAtom, gccVersionAtom } from "@/store/setting/setup"
import { systemNameAtom } from "@/store/system"
import { useAtom, useAtomValue } from "jotai"
import { useNavigate } from "react-router-dom"

export default function SetupCXX() {
  const [enableCxx, setEnableCxx] = useAtom(enableCxxAtom)
  const systemName = useAtomValue(systemNameAtom)
  const navigate = useNavigate()
  const btnInstall = (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={systemName != SystemName.windows} onClick={() => navigate("/install/msys2")}>
                  Install
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Only work on windows</p>
                <p>Download MSYS2 and install it automatically</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
  )
  return (
    <div className="shadow-md my-2 p-4">
      <div className="flex items-center gap-2">
        <Checkbox id="enableCpp" checked={enableCxx} onCheckedChange={(e: boolean) => setEnableCxx(e)} />
        <label className="text-sm font-medium leading-none" htmlFor="enableCpp">
          Enable C++
        </label>
      </div>
      {!enableCxx ? null : (
        <>
          <PrefProgram
            leading="C++ Compiler Path"
            valueAtom={gccPathAtom as any}
            versionAtom={gccVersionAtom as any}
            versionFallback="File not found"
          >
            {btnInstall}
          </PrefProgram>
          <PrefProgram
            leading="Clangd Path"
            valueAtom={clangdPathAtom as any}
            versionAtom={clangdVersionAtom as any}
            versionFallback="File not found"
          >
            {btnInstall}
          </PrefProgram>
        </>
      )}
    </div>
  )
}
