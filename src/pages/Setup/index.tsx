import PrefSelect from "@/components/pref/Select"
import {
  availableLanguageListAtom,
  clangdVersionAtom,
  defaultLanguageAtom,
  enableCxxAtom,
  enablePythonAtom,
  gccVersionAtom,
  hostnameAtom,
  pyrightsVersionAtom,
  pythonVersionAtom,
  setupDeviceAtom,
} from "@/store/setting"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as log from "tauri-plugin-log-api"
import Logo from "./logo"
import SetupCXX from "../../components/pref/setup/setup-cxx"
import SetupPy from "../../components/pref/setup/setup-py"
import { Button } from "@/components/ui/button"
import useReadAtom from "@/hooks/useReadAtom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Setup() {
  const hostname = useAtomValue(hostnameAtom)
  const [setupHostname, setSetupHostname] = useAtom(setupDeviceAtom)
  const navgiate = useNavigate()
  const availableLanguageList = useAtomValue(availableLanguageListAtom)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const readDefaultLang = useReadAtom(defaultLanguageAtom)
  const cxxCfg = {
    readEnable: useReadAtom(enableCxxAtom),
    readGCCV: useReadAtom(gccVersionAtom),
    readClangdV: useReadAtom(clangdVersionAtom),
  }
  const pythonCfg = {
    readEnable: useReadAtom(enablePythonAtom),
    readPythonV: useReadAtom(pythonVersionAtom),
    readPyrightsV: useReadAtom(pyrightsVersionAtom),
  }

  useEffect(() => {
    log.info(`hostname: ${hostname}`)
    log.info(`setupHostname: ${setupHostname}`)

    if (setupHostname == hostname) {
      navgiate("/editor")
    }
  }, [setupHostname])

  async function done() {
    const defaultLang = await readDefaultLang()
    if (defaultLang == null) {
      setAlertMessage("The default language must be setted")
      setAlertOpen(true)
      return
    }
    if ((await cxxCfg.readEnable()) && (await cxxCfg.readGCCV()) == null) {
      setAlertMessage("C++ Compiler Path must be setted for compiling c++ program")
      setAlertOpen(true)
      return
    }
    if ((await cxxCfg.readEnable()) && (await cxxCfg.readClangdV()) == null) {
      setAlertMessage("Clangd Path must be setted for providing code auto-completation and lints")
      setAlertOpen(true)
      return
    }
    if ((await pythonCfg.readEnable()) && (await pythonCfg.readPythonV()) == null) {
      setAlertMessage("Python Interpreter Path must be setted for run python program")
      setAlertOpen(true)
      return
    }
    if ((await pythonCfg.readEnable()) && (await pythonCfg.readPyrightsV()) == null) {
      setAlertMessage("Pyrights Path must be setted for providing code auto-completation and lints")
      setAlertOpen(true)
      return
    }
    setSetupHostname(hostname)
    navgiate("/editor")
  }

  return (
    <div className="select-none flex-1 overflow-auto">
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mx-32 my-8">
        <Logo />
        <ul className="my-16">
          <li>
            <PrefSelect
              leading="Default Language:"
              items={availableLanguageList.state == "hasData" ? availableLanguageList.data : []}
              atom={defaultLanguageAtom as any}
            />
          </li>
          <li>
            <SetupCXX />
          </li>
          <li>
            <SetupPy />
          </li>
          <li>
            <div className="flex flex-row-reverse">
              <Button className="bg-green-600 hover:bg-green-500" onClick={done}>
                Done
              </Button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
