import { YjsNS, createYjsHook } from "@/lib/hooks/useY"
import { LanguageMode } from "@/lib/ipc"
import { v4 as uuid } from "uuid"
import { map, uniq } from "lodash/fp"
import { useEffect, useState } from "react"
import { Doc, Text, Array, Map } from "yjs"
import { StaticSourceData, fillSource } from "@/lib/fs/model"

export enum JudgeStatus {
  AC,
  TLE,
  WA,
  RE,
  PD,
  CE,
  UK,
  UKE,
  INT,
}

/**
 * Testcase access helper
 */
export class Testcase {
  map: Map<any>
  constructor(map: Map<any>) {
    this.map = map
    if (!map.has("id")) {
      map.set("input", new Text())
      map.set("except", new Text())
      map.set("id", uuid())
      map.set("stdout", "")
      map.set("status", "")
      map.set("stderr", "")
      map.set("report", "")
    }
  }

  get id(): string {
    return this.map.get("id") as string
  }
  get input(): Text {
    return this.map.get("input") as Text
  }
  get except(): Text {
    return this.map.get("except") as Text
  }

  set stdout(value: string) {
    this.map.set("stdout", value)
  }
  get stdout(): string {
    return this.map.get("stdout")
  }
  useStdout(): string {
    return createYjsHook(this.map.get("stdout"), this.map, (v) => v.get("stdout"))
  }
  get status(): JudgeStatus {
    let value = this.map.get("status")
    if (value != undefined && JudgeStatus[value] != undefined) {
      return value
    } else {
      return JudgeStatus.UK
    }
  }
  set status(value: JudgeStatus) {
    this.map.set("status", value)
  }
  useStatus(): JudgeStatus {
    return createYjsHook(this.status, this.map, () => this.status)
  }
  get stderr(): string {
    return this.map.get("stderr")
  }
  set stderr(value: string) {
    this.map.set("stderr", value)
  }
  useStderr(): string {
    return createYjsHook(this.map.get("stderr"), this.map, (v) => v.get("stderr"))
  }
  get report(): string {
    return this.map.get("report")
  }
  set report(value: string) {
    this.map.set("report", value)
  }
  useReport(): string {
    return createYjsHook(this.map.get("report"), this.map, (v) => v.get("report"))
  }
}

export class Source {
  private store: YjsNS
  constructor(store: YjsNS) {
    this.store = store
  }

  get id(): string {
    return this.store.id
  }

  get name(): Text {
    return this.store.getText("name")
  }
  useName(): string {
    return this.store.useText("name")
  }

  get url(): string | undefined {
    return this.store.getString("url")
  }
  set url(url: string | undefined) {
    this.store.setString("url", url)
  }

  get contestUrl(): string | undefined {
    return this.store.getString("contest")
  }
  set contestUrl(url: string | undefined) {
    this.store.setString("contest", url)
  }

  get private(): boolean {
    return this.store.getBool("private")
  }
  set private(priv: boolean) {
    this.store.setBool("private", priv)
  }
  get language(): LanguageMode {
    return (this.store.getString("language") as LanguageMode) ?? LanguageMode.UNKNOW
  }
  set language(lang: LanguageMode) {
    this.store.setString("language", lang)
  }

  useLanguage(): string {
    return this.store.useString("language") ?? LanguageMode.UNKNOW
  }

  get source(): Text {
    return this.store.getText("source")
  }

  set timelimit(ms: number) {
    this.store.setNumber("timelimit", ms)
  }
  get timelimit(): number {
    return this.store.getNumber("timelimit")
  }
  useTimelimit(): number {
    return this.store.useNumber("timelimit")
  }
  set memorylimit(bytes: number) {
    this.store.setNumber("memorylimit", bytes)
  }
  get memorylimit(): number {
    return this.store.getNumber("memorylimit")
  }

  get checker(): string | undefined {
    return this.store.getString("checker")
  }

  set checker(name: string) {
    this.store.setString("checker", name)
  }
  useChecker(): string | undefined {
    return this.store.useString("checker")
  }

  private get tests(): Array<Map<any>> {
    return this.store.getArray("tests")
  }
  get testsLength(): number {
    return this.tests.length
  }
  useTestsLength(): number {
    const [len, setLen] = useState(this.testsLength)
    useEffect(() => {
      const cb = () => {
        setLen(this.testsLength)
      }
      this.tests.observe(cb)
      return () => this.tests.unobserve(cb)
    }, [])
    return len
  }
  useTests(): Testcase[] {
    const wrapWithHelper = map((v: Map<any>) => new Testcase(v))
    return createYjsHook(wrapWithHelper(this.tests.toArray()), this.tests, (v) => wrapWithHelper(v.toArray()))
  }

  getTest(index: number): Testcase {
    return new Testcase(this.tests.get(index))
  }
  pushEmptyTest() {
    this.tests.push([new Map<any>()])
  }
  deleteTest(index: number, length: number | undefined = undefined) {
    this.tests.delete(index, length)
  }

  serialize(): Uint8Array {
    return this.store.encode()
  }
  deserialize(data: Uint8Array) {
    this.store.decode(data)
  }
}

export class SourceStore {
  doc: Doc
  constructor(doc: Doc) {
    this.doc = doc

    // make id unique
    this.list.observe((event) => {
      if (event.changes.added.size > 0) {
        const data = this.list.toArray()
        const uniqueData = uniq(data)
        if (data.length != uniqueData.length) {
          this.doc.transact(() => {
            this.list.delete(0, this.list.length)
            this.list.insert(0, uniqueData)
          })
        }
      }
    })
  }
  get list(): Array<string> {
    return this.doc.getArray("source/list")
  }
  create(id: string = uuid()): [Source, string] {
    let subDoc = new YjsNS(this.doc, id)
    let store = new Source(subDoc)
    this.list.push([subDoc.id])
    return [store, subDoc.id]
  }
  createByDeserialization(data: Uint8Array, specifyId: string = uuid()): [Source, string] {
    const [src, id] = this.create(specifyId)
    src.deserialize(data)
    return [src, id]
  }
  createFromStatic(data: StaticSourceData, specifyId: string = uuid()): [Source, string] {
    const [src, id] = this.create(specifyId)
    fillSource(data, src)
    return [src, id]
  }
  get(id: string): Source | undefined {
    const map = this.doc.getMap()
    if (!map.has(id)) {
      return undefined
    }
    let subDoc = new YjsNS(this.doc, id)
    let store = new Source(subDoc)
    return store
  }
  delete(id: string) {
    const index = this.list.toArray().indexOf(id)
    if (index != -1) {
      let doc = this.doc.getMap().get(id) as Doc
      doc.destroy()
      this.list.delete(index)
    }
  }
}
