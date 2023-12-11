// TODO: impl authority in rust

import { Update, rebaseUpdates } from "@codemirror/collab"
import { ChangeSet, Text } from "@codemirror/state"
import * as log from 'tauri-plugin-log-api'

type OTOpenRPCRequest = {
  id: string,
  jsonrpc: string,
  method: "pullUpdates" | "pushUpdates" | "getDocument"
  params: {
    documentID: number
    version: number
    updates: Update[]
  }
}


type AuthorityCallBack = (response: any) => void

export class Authority {
  updates: Update[] = []
  doc = Text.of([""])
  id: number

  pendingPullUpdates: AuthorityCallBack[] = []

  constructor(id: number) {
    this.id = id
  }

  accept(request: OTOpenRPCRequest, cb: AuthorityCallBack) {
    log.info(JSON.stringify(request))
    if (request.method == "pullUpdates") {
      if (request.params.version < this.updates.length) {
        cb(this.updates.slice(request.params.version))
      } else {
        this.pendingPullUpdates.push(cb)
      }
    } else if (request.method == "pushUpdates") {
      let received: any = request.params.updates.map((json) => ({
        clientID: json.clientID,
        changes: ChangeSet.fromJSON(json.changes),
      }))
      if (request.params.version != this.updates.length) {
        received = rebaseUpdates(received, this.updates.slice(request.params.version))
      }
      for (let update of received) {
        this.updates.push(update)
        this.doc = update.changes.apply(this.doc)
      }
      cb(true)

      if (received.length) {
        let json = received.map((update: Update) => ({
          clientID: update.clientID,
          changes: update.changes.toJSON(),
        }))
        while (this.pendingPullUpdates.length) this.pendingPullUpdates.pop()!(json)
      }
    } else if (request.method == "getDocument") {
      cb({ version: this.updates.length, doc: this.doc.toString() })
    }
  }
}