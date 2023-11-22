import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactNode, useState } from "react"
export function useRenameDialog(
  callback: (newValue: string) => void,
): [ReactNode, (defaultValue: string) => void, boolean] {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [originTabName, setOriginTabName] = useState("")
  const [targetTabName, setTargetName] = useState("")
  function showDialog(defaultValue: string) {
    setOriginTabName(defaultValue)
    setRenameDialogOpen(true)
  }

  let element = (
    <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {originTabName}</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="name" className="sr-only">
            New Name
          </Label>
          <Input defaultValue={originTabName} onChange={(e) => setTargetName(e.target.value)} />
          <span className="text-end">
            <Button className="m-2" variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="m-2"
              onClick={() => {
                callback(targetTabName)
                setRenameDialogOpen(false)
              }}
            >
              Rename
            </Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
  return [element, showDialog, renameDialogOpen]
}
