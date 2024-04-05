import { atom, useAtom } from "jotai"
import { useEffect, useRef } from "react"
import cache from "@/lib/fs/cache"
import useReadAtom from "@/hooks/useReadAtom"
import { sourceAtom } from "@/store/source"
import { forEach } from "lodash/fp"

const alreadyLoadedAtom = atom(false)
/**
 * Load cache and insert to source store
 * It only be execuate on startup
 */

export default function useAutoSaveLoader() {
  const [alreadyLoaded, setAlreadyLoaded] = useAtom(alreadyLoadedAtom)
  const currentLoaded = useRef(false)
  const readSourceStore = useReadAtom(sourceAtom)
  useEffect(() => {
    // make sure it only be execuate once
    if (!alreadyLoaded && !currentLoaded.current) {
      setAlreadyLoaded(true)
      currentLoaded.current = true
      const store = readSourceStore()
      cache.loadAll().then((data) => {
        store.doc.transact(() => {
          forEach((v)=>store.createByDeserialization(v.data, v.id), data)
        })
      })
    }
  }, [alreadyLoaded])
}
