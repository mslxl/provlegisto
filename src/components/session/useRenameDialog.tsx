import { FaRandom } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReactNode, useRef, useState } from "react"
import generateRandomName from "@/lib/names"
export function useRenameDialog(): [ReactNode, (defaultValue: string) => Promise<string | undefined>] {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [currentValue, setCurrentValue] = useState("")
  const callback = useRef<(value: string | undefined) => void>()

  function showDialog(defaultValue: string): Promise<string | undefined> {
    setCurrentValue(defaultValue)
    setRenameDialogOpen(true)
    return new Promise((resolve) => {
      callback.current = resolve
    })
  }

  function cancel() {
    setRenameDialogOpen(false)
    if (callback.current) {
      callback.current(undefined)
      callback.current = undefined
    }
  }
  function confirm() {
    setRenameDialogOpen(false)
    if (callback.current) {
      callback.current(currentValue)
      callback.current = undefined
    }
  }
  function randomName() {
    setCurrentValue(generateRandomName("'s code"))
  }

  let element = (
    <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename File</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="name" className="sr-only">
            New Name
          </Label>
          <div className="flex gap-1">
            <Input className="flex-1" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
            <Button size="icon" variant="ghost" onClick={randomName}>
              <FaRandom />
            </Button>
          </div>
          <span className="text-end">
            <Button className="m-2" variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button className="m-2" onClick={confirm}>
              Rename
            </Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
  return [element, showDialog]
}
