import { useAddSources } from "@/store/source"
import { useEffect, useRef } from "react"
import * as cache from "@/lib/fs/cache"
import * as log from "tauri-plugin-log-api"
import { atom, useSetAtom } from "jotai"
import useReadAtom from "@/hooks/useReadAtom"

const recoveredAtom = atom(false)
recoveredAtom.debugPrivate = true

export default function StatusRecover() {
  const addSources = useAddSources()
  const recovered = useRef(false)

  const setIsRecovered = useSetAtom(recoveredAtom)
  const isRecovered = useReadAtom(recoveredAtom)

  useEffect(() => {
    log.info("recover status from cache")
    if (recovered.current) return // prevent strict mode retrigger load
    recovered.current = true
    if (isRecovered()) return // prevent compontent re-mount trigger load
    setIsRecovered(true)
    ;(async () => {
      const data = (await cache.recoverAllCache()).map(([title, source]) => ({ title, source }))
      addSources(data)
      await cache.dropAll()
      await Promise.all(data.map((d) => cache.updateCache(d.source.id, d.title, d.source)))
    })()
  }, [])

  return null
}
