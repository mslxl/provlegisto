import PrefProgram from "@/components/pref/Program"
import { Checkbox } from "@/components/ui/checkbox"
import { clangdPathAtom, clangdVersionAtom, enableCxxAtom, gccPathAtom, gccVersionAtom } from "@/store/setting"
import { useAtom } from "jotai"

export default function SetupCXX() {
  const [enableCxx, setEnableCxx] = useAtom(enableCxxAtom)
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
            leading="GNU G++ Path"
            valueAtom={gccPathAtom as any}
            versionAtom={gccVersionAtom as any}
            versionFallback="File not found"
            dialogFilter={[{name: 'GNU GCC/G++', extensions: ["gcc.exe", "g++.exe", "gcc", "g++"]}]}
          >
            {/* <Button>Install</Button> */}
          </PrefProgram>
          <PrefProgram
            leading="Clangd Path"
            valueAtom={clangdPathAtom as any}
            versionAtom={clangdVersionAtom as any}
            versionFallback="File not found"
          >
            {/* <Button>Install</Button> */}
          </PrefProgram>
        </>
      )}
    </div>
  )
}
