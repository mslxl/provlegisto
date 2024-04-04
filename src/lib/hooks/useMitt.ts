import mitt, { Handler } from "mitt"
import { DependencyList, useEffect } from "react"
type Events = {
  fileMenu: "new" | "newContest" | "open" | "openContest" | "save" | "saveAs"
  run: "all" | string
  cache: number
}

const emitter = mitt<Events>()

export function useMitt<Key extends keyof Events>(
  type: Key,
  handler: Handler<Events[Key]>,
  deps?: DependencyList | undefined,
): void {
  useEffect(() => {
    emitter.on(type, handler)
    return () => {
      emitter.off(type, handler)
    }
  }, deps)
}

export const emit = emitter.emit
