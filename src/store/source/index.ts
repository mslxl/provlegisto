import { Doc, Array } from "yjs"
import { SourceStore } from "./model"
import { atom } from "jotai"
import { forEach, includes, isEmpty, range } from "lodash/fp"
import * as log from "tauri-plugin-log-api"
import { LanguageMode } from "@/lib/ipc"
import { createYjsHookAtom } from "@/hooks/useY"
import cache from "@/lib/fs/cache"
import { fromSource } from "@/lib/fs/model"

export const docAtom = atom(new Doc())
export const sourceAtom = atom((get) => new SourceStore(get(docAtom)))

/**
 * An atom that observe all ids from doc,
 * which just for use source ids handy inside react component
 * 很难想象我是怀着什么样的心情写出这种抽象的 atom
 */
export const sourceIdsAtom = createYjsHookAtom<string[], Array<string>, Array<string>>(
  [],
  (ob) => ob,
  (v) => v.toArray(),
  (get) => get(sourceAtom).list,
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
    if (id == null && !isEmpty(idsList)) {
      return idsList[0]
    }
    if (includes(id)) {
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
export const activedSourceAtom = atom((get) => {
  const activedId = get(activedSourceIdAtom)
  const store = get(sourceAtom)
  if (activedId == null) return null
  return store.get(activedId)!!
})

/**
 * Create an empty source object inside doc
 * Return the new source
 */
export const createSourceAtom = atom(
  null,
  (get, _, targetLanguage: LanguageMode, defaultTimeLimits: number, defaultMemoryLimits: number) => {
    const store = get(sourceAtom)
    const [source, id] = store.create()
    store.doc.transact(() => {
      source.language = targetLanguage
      source.timelimit = defaultTimeLimits
      source.memorylimit = defaultMemoryLimits
      log.info(`create new source: ${id}`)
      log.info(JSON.stringify(get(sourceIdsAtom)))
    })
    cache.updateCache(id, () => fromSource(source))
    return source
  },
)

/**
 * Duplicate an new source object
 * return null if origin id is not exists
 */
export const duplicateSourceAtom = atom(null, (get, set, id: string, newName: (origin: string) => string) => {
  const store = get(sourceAtom)
  const source = store.get(id)
  if (source) {
    const newSource = set(createSourceAtom, source.language, source.timelimit, source.memorylimit)
    store.doc.transact(() => {
      if (source.checker) newSource.checker = source.checker
      newSource.contestUrl = source.contestUrl
      newSource.url = source.url
      newSource.name.insert(0, newName(source.name.toString()))
      newSource.private = source.private
      newSource.source.insert(0, source.source.toString())

      forEach(
        (index) => {
          newSource.pushEmptyTest()

          const srcTest = source.getTest(index)
          const dstTest = newSource.getTest(index)

          dstTest.input.insert(0, srcTest.input.toString())
          dstTest.except.insert(0, srcTest.except.toString())
        },
        range(0, source.testsLength ?? 0),
      )
    })

    cache.updateCache(newSource.id, () => fromSource(newSource))
    return newSource
  } else {
    return null
  }
})

/**
 * Delete an source by id and remove its cach
 * Do noting if it not exists
 */
export const deleteSourceAtom = atom(null, (get, _, id: string) => {
  const store = get(sourceAtom)
  if (store.get(id)) {
    cache.dropCache(id)
    store.delete(id)
  }
})
