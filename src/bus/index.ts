import { emit, listen } from "@tauri-apps/api/event"
import { info } from "tauri-plugin-log-api"

import mitt from "mitt"
const bus = mitt()
bus.on("*", (type, e) => {
  void info(`bus(${String(type)}) <- ${String(e)}`)
})

interface GlobalEventPayload {
  eventName: string
  data?: any
}
async function emitGlobal(name: string, data?: any): Promise<void> {
  const json = JSON.stringify(data)
  void info(`boardcase bus event ${name}: ${json}`)
  await emit("boardcast_bus_event", {
    event: name,
    data: json,
  })
}

listen("boardcast_bus_event", (event) => {
  const data = event.payload as GlobalEventPayload
  bus.emit(data.event, JSON.parse(data.data))
}).catch(console.error)

export default {
  ...bus,
  emitGlobal,
}
