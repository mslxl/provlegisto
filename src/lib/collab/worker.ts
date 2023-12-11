// TODO: impl authority in rust

import { Update, rebaseUpdates } from "@codemirror/collab"
import { ChangeSet, Text } from "@codemirror/state"
import { window } from "@tauri-apps/api"

type AuthorityRequest = {
  type: "pullUpdates" | "pushUpdates" | "getDocument"
  version: number
  updates: Update[]
}

type AuthorityCallBack = (response: any) => void

class Authority {
  updates: Update[] = []
  doc = Text.of([""])
  id: number
  listener: Promise<() => void>

  pendingPullUpdates: AuthorityCallBack[] = []

  constructor(id: number) {
    this.id = id
    this.listener = window.getCurrent().listen("prov://collab-recv", (event) => {
      let payload = event.payload as any
      let connectID = payload.connect
      this.accept(payload.data, (res)=>{

      });
    })
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
  public destroy() {
    this.listener.then((fn) => fn())
  }
}

// export default function getAuthority(id: number): Authority {}

// export default function closeAuthority(id: number) {}
