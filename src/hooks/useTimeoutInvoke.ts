import { useEffect, useRef } from "react"

export default function useTimeoutInvoke<T>(
  call: (params: T) => void,
  timeout: number,
): [(params: T) => void, (params: T) => void, () => void] {
  const timer = useRef<NodeJS.Timeout | null>(null)
  const param = useRef<T | null>(null)
  const caller = useRef<(params: T)=>void>()

  useEffect(()=>{
    caller.current = call
  }, [call])

  function cancel() {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }
  function delay(params: T) {
    param.current = params
    cancel()
    timer.current = setTimeout(() => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      caller.current!(param.current!)
    }, timeout)
  }
  function invokeNow(params: T) {
    cancel()
    caller.current!(params)
  }

  return [delay, invokeNow, cancel]
}
