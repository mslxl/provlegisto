import { Getter } from "jotai"
import { atomWithObservable } from "jotai/utils"
import { useEffect, useState } from "react"
import { Text, Array, AbstractType, Map, Doc } from "yjs"
export function createYjsHook<T, V extends AbstractType<any>>(initialValue: T, observer: V, updater: (y: V) => T): T {
  const [content, setContent] = useState(initialValue)
  useEffect(() => {
    function observeCallback() {
      setContent(() => updater(observer))
    }
    observeCallback()
    observer.observe(observeCallback)
    return () => observer.unobserve(observeCallback)
  }, [observer])
  return content
}

/**
 * Create an atom from yjs, note that useMemo is needed when the atom is created inside component
 * @param initialValue
 * @param observer
 * @param updater
 */
export function createYjsHookAtom<T, A, V extends AbstractType<any>>(
  initialValue: T,
  observerGet: (atomData: A)=>V,
  dataGet: (y: V, a: A,) => T,
  atomGet: (get: Getter) => A,
) {
  return atomWithObservable(
    (get) => {
      const atomData = atomGet(get)
      const yjsObserver = observerGet(atomData)
      return {
        subscribe(observer: { next: (data: T) => void }): { unsubscribe: () => void } {
          const cb = () => {
            const data = dataGet(yjsObserver, atomData)
            observer.next(data)
          }
          yjsObserver.observe(cb)
          return {
            unsubscribe() {
              yjsObserver.unobserve(cb)
            },
          }
        },
      }
    },
    { initialValue:  initialValue},
  )
}

export function useYText(ytext: Text): string {
  return createYjsHook(ytext.toString(), ytext, (v) => v.toString())
}

export function useYArray<T>(yarray: Array<T>): T[] {
  return createYjsHook(yarray.toArray(), yarray, (v) => v.toArray())
}

export function useYMap<V>(ymap: Map<V>) {
  return createYjsHook(ymap.toJSON(), ymap, (v) => v.toJSON())
}

export class YjsNS {
  doc: Doc
  id: string

  public constructor(doc: Doc, id: string) {
    this.doc = doc
    this.id = id
  }

  private getPrimitiveValueMap(): Map<number> {
    return this.doc.getMap(`ns/${this.id}/primitive`)
  }
  private getStringValueMap(): Map<string> {
    return this.doc.getMap(`ns/${this.id}/string`)
  }

  public getText(name: string): Text {
    return this.doc.getText(`ns/${this.id}/text/${name}`)
  }
  public getMap<V>(name: string): Map<V> {
    return this.doc.getMap(`ns/${this.id}/map/${name}`)
  }
  public getArray<V>(name: string): Array<V> {
    return this.doc.getArray(`ns/${this.id}/array/${name}`)
  }

  public getNumber(name: string): number {
    const map = this.getPrimitiveValueMap()
    if (!map.has(name)) {
      map.set(name, 0)
    }
    return map.get(name) as number
  }
  public setNumber(name: string, value: number) {
    const map = this.getPrimitiveValueMap()
    map.set(name, value)
  }

  public useNumber(name: string): number {
    const map = this.getPrimitiveValueMap()
    if (!map.has(name)) {
      map.set(name, 0)
    }
    return (createYjsHook(map.get(name) as number, map, (v) => v.get(name)) as number) ?? 0
  }

  public setString(name: string, value: string | undefined) {
    const map = this.getStringValueMap()
    if (value) {
      map.set(name, value)
    } else {
      map.delete(name)
    }
  }
  public getString(name: string): string | undefined {
    const map = this.getStringValueMap()
    return map.get(name)
  }
  public useString(name: string): string | undefined {
    const map = this.getStringValueMap()
    return createYjsHook(map.get(name), map, (v) => v.get(name))
  }

  public getBool(name: string): boolean {
    return this.getNumber(name) != 0
  }

  public setBool(name: string, value: boolean) {
    this.setNumber(name, value ? 1 : 0)
  }

  public useBool(name: string): boolean {
    return this.useNumber(name) != 0
  }

  public useText(name: string) {
    return useYText(this.getText(name))
  }
  public useArray(name: string) {
    return useYArray(this.getArray(name))
  }
  public useMap(name: string) {
    return useYMap(this.getMap(name))
  }
}
