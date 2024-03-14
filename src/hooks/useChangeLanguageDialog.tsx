import PrefSelect from "@/components/pref/Select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LanguageMode } from "@/lib/ipc"
import { availableLanguageListAtom } from "@/store/setting/setup"
import { useAtomValue } from "jotai"
import { ReactNode, useState } from "react"

export default function useChangeLanguageDialog(value: LanguageMode, onChange:(newValue:LanguageMode)=>void): [ReactNode, () => void, boolean] {
  const [dialogOpen, setDialogOpen] = useState(false)
  const available = useAtomValue(availableLanguageListAtom)

  function showDialog() {
    setDialogOpen(true)
  }

  function applyChange(v: string){
    //TODO: narrow type here
    onChange(v as any)
  }

  let element = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Language</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <PrefSelect leading="Language" value={value} onChange={applyChange} items={available.state == "hasData" ? available.data : []} />
          <span className="text-end">
            <Button className="m-2 bg-green-600 hover:bg-green-500" onClick={() => setDialogOpen(false)}>
              Ok
            </Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
  return [element, showDialog, dialogOpen]
}
