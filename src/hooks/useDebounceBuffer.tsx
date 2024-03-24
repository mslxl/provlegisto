import { debounce } from "lodash/fp"
import { DependencyList, useCallback, useRef } from "react"

export default function useDebounceBuffer<T>(initial: T, wait: number, flusher: (data: T) => void, deps: DependencyList) {
  const buffer = useRef(initial)
  const flush = useCallback(debounce(wait, flusher), [flusher, ...deps])
  return (updater: (oldValue: T) => T) => {
    buffer.current = updater(buffer.current)
    flush(buffer.current)
  }
}
