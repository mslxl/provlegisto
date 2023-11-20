import * as Sidebar from "@/components/ui/sidebar"
import { VscMenu, VscDebugAlt, VscSettingsGear } from "react-icons/vsc"
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

export default function PrimarySide() {
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
              <DropdownMenuItem>New File</DropdownMenuItem>
              <DropdownMenuItem>New Contest</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Open File</DropdownMenuItem>
              <DropdownMenuItem>Open Contest</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Open Recent</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {/* TODO: List here */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>More</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Clear Recently Open</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Help</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>About</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <Sidebar.Button>
        <VscDebugAlt className="text-2xl my-4" />
      </Sidebar.Button>
      <Sidebar.Space />
      <Sidebar.Button>
        <VscSettingsGear className="text-2xl my-4" />
      </Sidebar.Button>
    </Sidebar.Root>
  )
}
