import React, { useEffect, useState } from "react"
import LogoImage from "../../../src-tauri/icons/128x128@2x.png"
import { app } from "@tauri-apps/api"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { VscClose } from "react-icons/vsc"
import Contributer from "./contributer"
import { useZoom } from "@/lib/hooks/useZoom"
import { motion } from "framer-motion"

export default function About() {
  useZoom()
  const [version, setVersion] = useState("")
  const [tauriVersion, setTauriVersion] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    app.getVersion().then(setVersion)
    app.getTauriVersion().then(setTauriVersion)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "100%" }}
      exit={{ opacity: 0, height: 0 }}
      className="m-8 w-full shadow-md shadow-slate-400 select-none relative"
    >
      <button className="absolute right-4 top-4" onClick={() => navigate(-1)}>
        <VscClose />
      </button>
      <div className="flex flex-row items-center justify-center p-4">
        <img className="w-32 h-32 object-cover m-16" src={LogoImage} />
        <div>
          <div>
            <span className="font-bold text-2xl">Provlegisto </span>
            <span>v{version}</span>
          </div>
          <div>
            <p className="text-xs">
              based on Tauri {tauriVersion}, React {React.version} and many open source projects
            </p>
            <p className="text-xs my-2">
              Source:
              <a className="underline p-1" href="https://github.com/mslxl/provlegisto" target="__blank">mslxl/provlegisto</a>{" "}
            </p>
          </div>
        </div>
      </div>
      <Separator />
      <Contributer />
    </motion.div>
  )
}
