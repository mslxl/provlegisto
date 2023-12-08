import { useAddSources } from "@/store/source"
import { useEffect, useRef } from "react"
import * as cache from "@/lib/fs/cache"
import * as log from "tauri-plugin-log-api"

export default function StatusRecover() {
  const addSources = useAddSources()
  const recovered = useRef(false)

  useEffect(() => {
    log.info("recover status from cache")
    if (recovered.current) return
    recovered.current = true
    ;(async () => {
      const data = (await cache.recoverAllCache()).map(([title, source]) => ({ title, source }))
      addSources(data)
      await cache.dropAll()
      await Promise.all(data.map((d, id) => cache.updateCache(id, d.title, d.source)))
    })()
  }, [])

  return null
}
