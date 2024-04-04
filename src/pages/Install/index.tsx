import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { useTauriEvent } from "@/lib/hooks/useTauriEvent"
import { installMsys2 } from "@/lib/fs/installer"
import { clangdPathAtom, gccPathAtom } from "@/store/setting/setup"
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog"
import { motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { useEffect, useRef, useState } from "react"
import { VscClose } from "react-icons/vsc"
import { useNavigate, useParams } from "react-router-dom"

export default function Install() {
  const params = useParams()
  const installName = params.name
  const navigate = useNavigate()
  const setGcc = useSetAtom(gccPathAtom)
  const setClangd = useSetAtom(clangdPathAtom)
  const [fatal, setFatal] = useState(false)
  const logRef = useRef<HTMLPreElement | null>(null)

  const [dialogMessage, setDialogMessage] = useState("")
  const [dialogVisible, setDialogVisible] = useState(false)
  const [output, setOutput] = useState("")
  const running = useRef(false)

  useEffect(() => {
    if (running.current) return
    running.current = true
    if (params.name == "msys2") {
      installMsys2()
        .then((res) => {
          setGcc(res.gcc)
          setClangd(res.clangd)
          setDialogMessage("Installation completed")
          setDialogVisible(true)
        })
        .catch((e) => {
          setDialogMessage(e)
          setDialogVisible(true)
          setFatal(true)
        })
    } else {
      setDialogMessage("No such installer file")
      setDialogVisible(true)
    }
  }, [])

  useTauriEvent(
    "install_message",
    (msg) => {
      setOutput((pre) => `${pre}\n${msg.payload}`)
      if (logRef.current == null) return
      if (logRef.current.scrollTop + logRef.current.offsetHeight >= logRef.current.scrollHeight - 20) {
        logRef.current.scrollTo(0, logRef.current.scrollHeight)
      }
    },
    [setOutput],
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 m-8 shadow-lg p-4 flex flex-col gap-2 min-w-0"
    >
      <AlertDialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{fatal ? "Error" : "Message"}</AlertDialogTitle>
            <AlertDialogDescription>{dialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!fatal ? null : <AlertDialogCancel>See Logs</AlertDialogCancel>}
            <AlertDialogAction onClick={() => navigate(-1)}>Back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="relative">
        {!fatal ? null : (
          <button className="absolute right-4 top-4" onClick={() => navigate(-1)}>
            <VscClose />
          </button>
        )}
        <h2 className="font-bold text-2xl">Installing {installName}</h2>
        <p className="text-xs">DO NOT close the application, the installer is running background</p>
        <p className="text-xs">Girl in Prayer...</p>
      </div>
      <Progress />
      <div className="shadow-sm shadow-slate-950 flex-1 p-2 overflow-auto min-h-0 min-w-0">
        <pre ref={logRef}>{output}</pre>
      </div>
    </motion.div>
  )
}
