import { pullUpdates, pushUpdates } from "@/lib/ipc/collab/peer"
import { collab, getSyncedVersion, receiveUpdates, sendableUpdates } from "@codemirror/collab"
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view"
import Client from "@open-rpc/client-js"

export default function peerExtension(startVersion: number, documentID: number, client: Client) {
  let plugin = ViewPlugin.fromClass(
    class {
      private pushing = false
      private done = false

      constructor(private view: EditorView) {
        this.pull()
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.push()
      }

      async push() {
        let updates = sendableUpdates(this.view.state)
        if (this.pushing || !updates.length) return
        this.pushing = true
        let version = getSyncedVersion(this.view.state)
        await pushUpdates(client, version, documentID, updates)
        this.pushing = false
        // Regardless of whether the push failed or new updates came in
        // while it was running, try again if there's updates remaining
        if (sendableUpdates(this.view.state).length) {
          setTimeout(() => this.push(), 100)
        }
      }

      async pull() {
        while (!this.done) {
          try {
            let version = getSyncedVersion(this.view.state)
            let updates = await pullUpdates(client, version, documentID)
            this.view.dispatch(receiveUpdates(this.view.state, updates))
          } catch (e) {
            console.error(e)
          }
        }
      }

      destroy() {
        this.done = true
      }
    },
  )
  return [collab({ startVersion }), plugin]
}
