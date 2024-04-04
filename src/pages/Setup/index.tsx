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
} from "@/store/setting/setup"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Logo from "./logo"
import SetupCXX from "../../components/setup/setup-cxx"
import SetupPy from "../../components/setup/setup-py"
import { Button } from "@/components/ui/button"
import useReadAtom from "@/lib/hooks/useReadAtom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { motion } from "framer-motion"

export default function Setup() {
  const hostname = useAtomValue(hostnameAtom)
  const setSetupHostname = useSetAtom(setupDeviceAtom)
  const navgiate = useNavigate()
  const availableLanguageList = useAtomValue(availableLanguageListAtom)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [defaultLanguage, setDefaultLanguage] = useAtom(defaultLanguageAtom)

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

  async function done() {
    if (defaultLanguage == null) {
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
    navgiate("/")
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="select-none flex-1 overflow-auto">
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
              //TODO: narrow type here
              value={defaultLanguage as any} 
              onChange={setDefaultLanguage as any}
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
    </motion.div>
  )
}
