import { Update } from "@codemirror/collab"
import { Client } from "@open-rpc/client-js"
import { ChangeSet, Text } from "@codemirror/state"
import * as log from "tauri-plugin-log-api"

export async function pushUpdates(
  client: Client,
  version: number,
  documentId: number,
  fullUpdates: readonly Update[],
): Promise<void> {
  let updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
  }))
  let packet = {
    documentID: documentId,
    version,
    updates,
  }
  let result = await client.request({
    method: "pushUpdates",
    params: packet,
  })
  log.info("push updates: " + JSON.stringify(updates))
  return result
}

export async function pullUpdates(client: Client, version: number, documentId: number): Promise<Update[]> {
  let packet = {
    documentID: documentId,
    version,
  }
  let updates = await client
    .request(
      {
        method: "pullUpdates",
        params: packet,
      },
      24 * 60 * 60 * 1000,
    )
    .then((updates) =>
      (updates as Update[]).map((u) => ({
        changes: ChangeSet.fromJSON(u.changes),
        clientID: u.clientID,
      })),
    )
  log.info("pull updates: " + JSON.stringify(updates))
  return updates
}

export async function getDocument(client: Client, documentId: number) {
  let packet = {
    documentID: documentId,
  }
  let doc = await client
    .request({
      method: "getDocument",
      params: packet,
    })
    .then((data) => ({
      version: data.version,
      doc: Text.of(data.doc.split("\n")),
    }))
  log.info("get document: " + JSON.stringify(doc))
  return doc
}
