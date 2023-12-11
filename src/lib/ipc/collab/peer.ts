import { Update } from "@codemirror/collab"
import { Client } from "@open-rpc/client-js"
import { Text } from "@codemirror/state"

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
  await client.request({
    method: "pushUpdates",
    params: packet,
  })
}

export async function pullUpdates(client: Client, version: number, documentId: number): Promise<Update[]> {
  let packet = {
    documentID: documentId,
    version,
  }
  return await client.request(
    {
      method: "pullUpdates",
      params: packet,
    },
    24 * 60 * 60 * 1000,
  )
}

export async function getDocument(client: Client, documentId: number) {
  let packet = {
    documentID: documentId,
  }
  return await client
    .request({
      method: "getDocument",
      params: packet,
    })
    .then((data) => ({
      version: data.version,
      doc: Text.of(data.doc.split("\n")),
    }))
}
