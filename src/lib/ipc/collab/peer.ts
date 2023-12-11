import { Update } from "@codemirror/collab"

export function pushUpdates(
  connection: WebSocket,
  version: number,
  documentId: number,
  fullUpdates: readonly Update[],
): Promise<void> {
  let updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
  }))
  let data = {
    type: "pushUpdates",
    version,
    updates,
  }
  let packet = {
    documentID: documentId,
    data
  }
  return new Promise((resolve, reject)=>{
    connection.onmessage = (message) => {
      connection.onmessage = null
      resolve(message.data)
    }
    connection.onerror = (err) => {
      connection.onerror = null
      reject(err)
    }
    connection.send(JSON.stringify(packet))
  })
}

export function pullUpdates(connection: WebSocket, version: number, documentId: number): Promise<Update[]> {
  return new Promise((resolve, reject) => {
    connection.onmessage = (message) => {
      connection.onmessage = null
      resolve(message.data)
    }
    connection.onerror = (err) => {
      connection.onerror = null
      reject(err)
    }
    let data = {
      type: "pullUpdates",
      version,
    }
    let packet  = {
      documentID: documentId,
      data
    }
    connection.send(JSON.stringify(packet))
  })
}

export function getDocument(connection: WebSocket, documentId: number) {
  return new Promise((resolve, reject) => {
    connection.onmessage = (message) => {
      connection.onmessage = null
      resolve(message.data)
    }
    connection.onerror = (err) => {
      connection.onerror = null
      reject(err)
    }
    let data = {
      type: "getDocument",
    }
    let packet = {
      documentID: documentId,
      data
    }
    connection.send(JSON.stringify(packet))
  })
}
