import * as Sidebar from "@/components/ui/sidebar"
import { VscMenu, VscVmRunning, VscSettingsGear, VscOrganization, VscTypeHierarchySub } from "react-icons/vsc"
import { primaryPanelShowAtom } from "@/store/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { emit } from "@/hooks/useMitt"
import { useAtom, useAtomValue } from "jotai"
import { ReactNode } from "react"
import { openDevTools } from "@/lib/ipc"
import { Link, useNavigate } from "react-router-dom"
import clsx from "clsx"
import { collabEnableAtom } from "@/store/setting/collab"

export default function PrimarySide() {
  const [panel, setPanel] = useAtom(primaryPanelShowAtom)
  const navigate = useNavigate()

  function onPanelButtonClick(panelId: string) {
    if (panelId == panel) setPanel(null)
    else setPanel(panelId)
  }

  const collabEnable = useAtomValue(collabEnableAtom)

  const panelBtn = (
    [
      ["run", <VscVmRunning className="text-2xl my-4" />],
      ["collab", <VscOrganization className={clsx("text-2xl my-4", { hidden: !collabEnable })} />],
      ["version", <VscTypeHierarchySub className="text-2xl my-4 hidden" />],
    ] as [string, ReactNode][]
  ).map((item, index) => (
    <Sidebar.Button
      key={index}
      className={clsx({
        "text-neutral-100 border-l-4 border-l-neutral-100": item[0] == panel,
      })}
      onClick={() => onPanelButtonClick(item[0])}
    >
      {item[1]}
    </Sidebar.Button>
  ))

  return (
    <Sidebar.Root className="h-full">
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-visible:outline-none text-neutral-400 hover:text-neutral-100 mx-auto text-center">
          <VscMenu className="text-lg my-1 mt-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>File</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => emit("fileMenu", "new")}>New File</DropdownMenuItem>
              {/* <DropdownMenuItem>New Contest</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => emit("fileMenu", "open")}>Open File</DropdownMenuItem>
              {/* <DropdownMenuItem>Open Contest</DropdownMenuItem> */}
              {/* <DropdownMenuSub>
                <DropdownMenuSubTrigger>Open Recent</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  TODO: List here
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>More</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Clear Recently Open</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => emit("fileMenu", "save")}>Save</DropdownMenuItem>
              <DropdownMenuItem onClick={() => emit("fileMenu", "saveAs")}>Save As...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/pref">Preferences</Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Help</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => openDevTools()}>Open Devtools</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/about">About</Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      {panelBtn}
      <Sidebar.Space />
      <Sidebar.Button onClick={() => navigate("/pref")}>
        <VscSettingsGear className="text-2xl my-4" />
      </Sidebar.Button>
    </Sidebar.Root>
  )
}
