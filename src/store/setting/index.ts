import * as log from "tauri-plugin-log-api"
import { Store } from "tauri-plugin-store-api"
import { atomWithStorage } from "jotai/utils"
import { getSettingsPath } from "@/lib/ipc"

let store: Store | null = null
export async function loadSettingsStore() {
  const path = await getSettingsPath()
  store = new Store(path)
  return
}

export function atomWithSettings<T>(key: string, initialValue: T) {
  const atom = atomWithStorage(
    key,
    initialValue,
    {
      async getItem(key, initialValue) {
        if (store == null) throw new Error("Store not init")
        return (await store.get(key)) ?? initialValue
      },
      async setItem(key, newValue) {
        if (store == null) throw new Error("Store not init")
        await store!.set(key, newValue)
      },
      async removeItem(key) {
        if (store == null) throw new Error("Store not init")
        await store.delete(key)
      },
      subscribe(key, callback, initialValue) {
        const unlisten = store!.onChange((k, value) => {
          if (key == k && value != initialValue) callback(value as T)
        })
        return () => {
          unlisten.then((fn) => fn()).catch((reson) => log.error(reson))
        }
      },
    },
    {
      unstable_getOnInit: true,
    },
  )
  atom.debugLabel = `settings.${key}`
  return atom
}