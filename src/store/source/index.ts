import { Doc } from "yjs"
import { SourceStore } from "./model"
import { atom } from "jotai"
import { atomWithObservable } from "jotai/utils"
import { includes, isEmpty } from "ramda"
import * as log from 'tauri-plugin-log-api'
import { LanguageMode } from "@/lib/ipc"
import { defaultLanguageAtom } from "../setting/setup"

export const docAtom = atom(new Doc())
export const sourceAtom = atom((get) => new SourceStore(get(docAtom)))

/**
 * An atom that observe all ids from doc,
 * which just for use source ids handy inside react component
 * 很难想象我是怀着什么样的心情写出这种抽象的 atom
 */
export const sourceIdsAtom = atomWithObservable(
  (get) => {
    const list = get(sourceAtom).list
    return {
      subscribe(observer: { next: (data: string[]) => void }): { unsubscribe: () => void } {
        const cb = () => {
          observer.next(list.toArray())
        }
        list.observe(cb)
        return {
          unsubscribe() {
            list.unobserve(cb)
          },
        }
      },
    }
  },
  { initialValue: [] },
)

const activedSourceIdUncheckedAtom = atom<string | null>(null)

/**
 * Current actived source id
 * It will be set to null if the id is not exists, means noting be actived
 */
export const activedSourceIdAtom = atom<string | null, [id: string | null], void>(
  (get) => {
    const id = get(activedSourceIdUncheckedAtom)
    const idsList = get(sourceIdsAtom)
    if(id == null && !isEmpty(idsList)){
      return idsList[0]
    }
    if (includes(id, )) {
      return id
    }
    return null
  },
  (get, set, id) => {
    if (includes(id, get(sourceIdsAtom))) {
      set(activedSourceIdUncheckedAtom, id)
    } else {
      set(activedSourceIdUncheckedAtom, null)
    }
  },
)

/**
 * Current actived source object
 * Readonly atom
 */
export const activedSourceAtom = atom((get)=>{
  const activedId = get(activedSourceIdAtom)
  const store = get(sourceAtom)
  if(activedId == null) return null
  return store.get(activedId)!!
})

/**
 * Create an empty source object inside doc
 * Return the new source 
 */
export const createSourceAtom = atom(null, (get, _, targetLanguage:LanguageMode)=>{
  const store = get(sourceAtom)
  const [source, id] = store.create()
  source.language = targetLanguage
  log.info(`create new source: ${id}`)
  log.info(JSON.stringify(get(sourceIdsAtom)))
  return source
})


/**
 * Delete an source by id
 * Do noting if it not exists
 */
export const deleteSourceAtom = atom(null, (get, _, id:string)=>{
  const store = get(sourceAtom)
  store.delete(id)
})

