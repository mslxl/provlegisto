import { useEffect, useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import { collabProviderAtom, useExitRoom } from "@/store/collab"
import { Separator } from "../ui/separator"
import styled from "styled-components"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { activeIdAtom, emptySource, sourceIndexAtoms, sourceStoreAtom, useAddSources } from "@/store/source"
import { LanguageMode } from "@/lib/ipc"
import * as log from "tauri-plugin-log-api"
import { Button } from "../ui/button"
import { LucideDoorOpen } from "lucide-react"
import { find } from "lodash"

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

export default function OnlineUsers() {
  const yProvider = useAtomValue(collabProviderAtom)
  const [users, setUsers] = useState<User[]>([])

  const sourceIndex = useAtomValue(sourceIndexAtoms)
  const sourceStore = useAtomValue(sourceStoreAtom)
  const activeSourceId = useAtomValue(activeIdAtom)

  // calc user info
  const localUserAwareData = useMemo(
    () => ({
      active: find(sourceIndex, (v) => v.id == activeSourceId)?.title,
      sources: sourceIndex
        .filter((head) => !sourceStore[head.id].remote)
        .map((head) => ({
          uuid: sourceStore[head.id].id,
          title: head.title,
          url: sourceStore[head.id].url,
          lang: sourceStore[head.id].code.language,
          contest: sourceStore[head.id].contest,
        })),
    }),
    [sourceStore, sourceIndex, activeSourceId],
  )

  // push info
  useEffect(() => {
    if (yProvider == null) return

    const awareness = yProvider.awareness
    awareness.setLocalStateField("doc", localUserAwareData)
  }, [yProvider, localUserAwareData])

  // pull info from other peers
  useEffect(() => {
    if (yProvider == null) {
      setUsers([])
      return
    }

    const awareness = yProvider.awareness
    function updater() {
      const data = Array.from(awareness.getStates().values())
      log.info(`awareness: ${JSON.stringify(data)}`)
      const result: User[] = data
        .filter((u) => u.user != undefined)
        .map((u) => ({
          name: u.user.name,
          focus: u.doc.active,
          color: u.user.color,
          doc: u.doc.sources ?? [],
        }))

      setUsers(result)
    }

    yProvider.awareness.on("change", updater)
    updater()
    return () => {
      yProvider.awareness.off("change", updater)
    }
  }, [yProvider])

  const addSources = useAddSources()
  function openUUID(uuid: string, language: LanguageMode, title: string) {
    const src = emptySource(LanguageMode.CXX)
    src.id = uuid
    src.remote = true
    src.code.language = language
    addSources([{ title, source: src }])
  }

  const exitRoom = useExitRoom()

  return (
    <div className="p-4">
      <div>
        <div className="flex">
          <Button size="icon" onClick={exitRoom} variant="ghost">
            <LucideDoorOpen />
          </Button>
          <h3 className="font-bold text-xl my-2 flex-1">Online Users</h3>
        </div>
        <Separator />
        <Accordion type="multiple">
          {users.map((u) => (
            <AccordionItem value={u.name} key={u.name}>
              <AccordionTrigger className="py-2">
                <Username color={u.color}>{u.name}</Username>
                <span className="flex-1"></span>
                <span className="text-xs text-neutral-600">{u.focus}</span>
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
  )
}
