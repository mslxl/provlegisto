import { atom, useAtom } from "jotai"
import { useEffect } from "react"
import cache from "@/lib/fs/cache"
import useReadAtom from "@/hooks/useReadAtom"
import { sourceAtom } from "@/store/source"
import { forEach } from "lodash/fp"
import { StaticSourceData } from "@/lib/fs/model"

const alreadyLoadedAtom = atom(false)
/**
 * Load cache and insert to source store
 * It only be execuate on startup
 */

export default function CacheLoader() {
  const [alreadyLoaded, setAlreadyLoaded] = useAtom(alreadyLoadedAtom)
  const readSourceStore = useReadAtom(sourceAtom)
  useEffect(() => {
    // make sure it only be execuate once
    if (!alreadyLoaded) {
      setAlreadyLoaded(true)
      const store = readSourceStore()
      cache.loadAll().then((data) => {
        store.doc.transact(() => {
          forEach((v: StaticSourceData)=>store.createFromStatic(v), data)
        })
      })
    }
  }, [alreadyLoaded])
  return null
}
