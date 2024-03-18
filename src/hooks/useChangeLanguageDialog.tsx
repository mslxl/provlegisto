import PrefSelect from "@/components/pref/Select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LanguageMode } from "@/lib/ipc"
import { availableLanguageListAtom, defaultLanguageAtom } from "@/store/setting/setup"
import { useAtomValue } from "jotai"
import { ReactNode, useRef, useState } from "react"

export default function useChangeLanguageDialog(): [
  ReactNode,
  (value: LanguageMode) => Promise<LanguageMode | undefined>,
] {
  const [dialogOpen, setDialogOpen] = useState(false)
  const defaultValue = useAtomValue(defaultLanguageAtom)
  const [currentValue, setCurrentValue] = useState(defaultValue)
  const available = useAtomValue(availableLanguageListAtom)
  const resolveCallback = useRef<(value: LanguageMode | undefined) => void>()

  function showDialog(value: LanguageMode): Promise<LanguageMode | undefined> {
    setCurrentValue(value)
    setDialogOpen(true)
    return new Promise((resolve) => {
      resolveCallback.current = resolve
    })
  }

  function confirm() {
    setDialogOpen(false)
    if (resolveCallback.current) {
      resolveCallback.current(currentValue)
    }
    resolveCallback.current = undefined
  }
  function cancel() {
    setDialogOpen(false)
    if (resolveCallback.current) {
      resolveCallback.current(undefined)
    }
    resolveCallback.current = undefined
  }

  let element = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Language</DialogTitle>
        </DialogHeader>
        <div className="grid flex-1 gap-2">
          <PrefSelect
            leading="Language"
            value={currentValue}
            onChange={(v) => setCurrentValue(v as LanguageMode)}
            items={available.state == "hasData" ? available.data : []}
          />
          <span className="text-end">
            <Button className="m-2 bg-green-600 hover:bg-green-500" onClick={confirm}>
              Ok
            </Button>
            <Button className="m-2" onClick={cancel}>
              Cancel
            </Button>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
  return [element, showDialog]
}
