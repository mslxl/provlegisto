// TODO: impl authority in rust

import { Update, rebaseUpdates } from "@codemirror/collab"
import { ChangeSet, Text } from "@codemirror/state"

type AuthorityRequest = {
  type: "pullUpdates" | "pushUpdates" | "getDocument"
  version: number
  updates: Update[]
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

  accept(request: AuthorityRequest, cb: AuthorityCallBack) {
    if (request.type == "pullUpdates") {
      if (request.version < this.updates.length) {
        cb(this.updates.slice(request.version))
      } else {
        this.pendingPullUpdates.push(cb)
      }
    } else if (request.type == "pushUpdates") {
      let received: any = request.updates.map((json) => ({
        clientID: json.clientID,
        changes: ChangeSet.fromJSON(json.changes),
      }))
      if (request.version != this.updates.length) {
        received = rebaseUpdates(received, this.updates.slice(request.version))
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
    } else if (request.type == "getDocument") {
      cb({ version: this.updates.length, doc: this.doc.toString() })
    }
  }
}