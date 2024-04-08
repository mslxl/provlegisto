import { atom, useAtom } from "jotai"
import { useEffect, useRef } from "react"
import useReadAtom from "@/lib/hooks/useReadAtom"
import { sourceAtom } from "@/store/source"
import { readSession, saveSession } from "@/lib/fs/session"
import { window as tauriWin } from "@tauri-apps/api"

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
      readSession().then((session) => {
        if (session) {
          store.deserialize(session)
        }
      })
    }
  }, [alreadyLoaded])

  // save source store on close
  useEffect(() => {
    const unlisten = tauriWin.getCurrent().listen("tauri://close-requested", async () => {
      const store = readSourceStore()
      await saveSession(store.serialize())
      tauriWin.getCurrent().close()
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [readSourceStore])
}
