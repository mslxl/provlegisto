import clsx from "clsx"
import { Button } from "../ui/button"
import { VscLink } from "react-icons/vsc"
import CollabConf from "../collab-conf"
import { useEffect, useRef, useState } from "react"
import { useAtomValue } from "jotai"
import { collabProviderAtom } from "@/store/collab"
import { Separator } from "../ui/separator"
import styled from "styled-components"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { emptySource, sourceIndexAtoms, sourceStoreAtom, useAddSources } from "@/store/source"
import { LanguageMode } from "@/lib/ipc"
import * as log from 'tauri-plugin-log-api'

type CollabProps = {
  className?: string
}

type User = {
  name: string
  focus: string
  color: string
  doc: UserDoc[]
}
type UserDoc = {
  uuid: string
  title: string
  lang: LanguageMode
  url?: string
  contest?: string
}

const Username = styled.span<{ color: string }>`
  color: ${(p) => p.color};
  -webkit-text-stroke: 1px ${(p) => p.color};
`

export default function Collab(props: CollabProps) {
  const [confDialog, setConfDialog] = useState(false)

  const yProvider = useAtomValue(collabProviderAtom)
  const [users, setUsers] = useState<User[]>([])

  const sourceIndex = useAtomValue(sourceIndexAtoms)
  const sourceStore = useAtomValue(sourceStoreAtom)

  // upload info
  useEffect(() => {
    if (yProvider == null) return

    const data: UserDoc[] = sourceIndex
      .filter((head) => !sourceStore[head.id].remote)
      .map((head) => ({
        uuid: sourceStore[head.id].uuid,
        title: head.title,
        url: sourceStore[head.id].url,
        lang: sourceStore[head.id].code.language,
        contest: sourceStore[head.id].contest,
      }))

    const awareness = yProvider.awareness
    awareness.setLocalStateField("doc", data)
  }, [yProvider, sourceStore, sourceIndex])

  // update local cursor info
  const uuidTitleDict = useRef(new Map<string, string>())
  useEffect(() => {
    if (yProvider == null) {
      setUsers([])
      return
    }

    const awareness = yProvider.awareness
    function updater() {
      const data = Array.from(awareness.getStates().values())
      log.info(`awareness: ${JSON.stringify(data)}`)
      const result: User[] = data.map((u) => ({
        name: u.user.name,
        focus: u.cursor?.head.tname ?? "none",
        color: u.user.color,
        doc: u.doc ?? [],
      }))

      for (let u of result) {
        for (let doc of u.doc) {
          uuidTitleDict.current.set(`src-${doc.uuid}`, `${u.name}/${doc.title}`)
        }
      }
      setUsers(result)
    }

    yProvider.awareness.on("change", updater)
    return () => {
      yProvider.awareness.off("change", updater)
    }
  }, [yProvider])

  const addSources = useAddSources()
  function openUUID(uuid: string, language: LanguageMode, title: string) {
    const src = emptySource(LanguageMode.CXX)
    src.uuid = uuid
    src.remote = true
    src.code.language = language
    addSources([{ title, source: src }])
  }

  return (
    <div className={clsx(props.className, "h-full select-none")}>
      <CollabConf open={confDialog} onOpenChange={setConfDialog} />
      <div className="p-4">
        <div className="flex flex-row items-center">
          <span className="flex-1"></span>
          <Button onClick={() => setConfDialog(true)}>
            <VscLink />
          </Button>
        </div>
        <div>
          <h3 className="font-bold text-xl my-2">Online Users</h3>
          <Separator />
          <Accordion type="multiple">
            {users.map((u) => (
              <AccordionItem value={u.name} key={u.name}>
                <AccordionTrigger className="py-2">
                  <Username color={u.color}>{u.name}</Username>
                  <span className="flex-1"></span>
                  <span className="text-xs text-neutral-600">{uuidTitleDict.current.get(u.focus)}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul>
                    {u.doc.map((d) => (
                      <li key={d.uuid} onClick={() => openUUID(d.uuid, d.lang, `${u.name}/${d.title}`)}>
                        {d.title}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <ul className="my-2"></ul>
        </div>
      </div>
    </div>
  )
}
