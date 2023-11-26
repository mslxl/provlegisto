import React, { useEffect, useState } from "react"
import LogoImage from "../../../src-tauri/icons/128x128@2x.png"
import { app } from "@tauri-apps/api"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"
import { VscClose } from "react-icons/vsc"
import Contributer from "./contributer"

export default function About() {
  const [version, setVersion] = useState("")
  const [tauriVersion, setTauriVersion] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    app.getVersion().then(setVersion)
    app.getTauriVersion().then(setTauriVersion)
  }, [])

  return (
    <div className="m-8 w-full shadow-md shadow-slate-400 select-none relative">
      <button className="absolute right-4 top-4" onClick={() => navigate(-1)}>
        <VscClose />
      </button>
      <div className="flex flex-row items-center justify-center p-4">
        <img className="w-48 h-48 object-cover" src={LogoImage} />
        <div>
          <div>
            <span className="font-bold text-2xl">Provlegisto </span>
            <span>v{version}</span>
          </div>
          <div>
            <span className="text-xs">
              based on Tauri {tauriVersion}, React {React.version} and many open source projects
            </span>
          </div>
        </div>
      </div>
      <Separator />
      <Contributer/>
    </div>
  )
}
