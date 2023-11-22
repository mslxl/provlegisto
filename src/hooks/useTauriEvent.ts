import { event } from "@tauri-apps/api"
import { DependencyList, useEffect } from "react"

interface Event<T> {
  /** Event name */
  event: string
  /** The label of the window that emitted this event. */
  windowLabel: string
  /** Event identifier used to unlisten */
  id: number
  /** Event payload */
  payload: T
}
type EventCallback<T> = (event: Event<T>) => void
export function useTauriEvent<T>(eventName: string, listener: EventCallback<T>, deps?: DependencyList | undefined) {
  useEffect(() => {
    const unbind = event.listen(eventName, listener)

    return () => {
      unbind.then((fn) => {
        fn()
      })
    }
  }, deps)
}
