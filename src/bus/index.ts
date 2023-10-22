import { emit, listen } from "@tauri-apps/api/event"

import mitt from "mitt"
import { onMounted, onUnmounted } from "vue"
const bus = mitt()
bus.on("*", (type, e) => {
  console.log(`bus(${String(type)}) <- ${String(e)}`)
})

interface GlobalEventPayload {
  event: string
  data?: any
}

function $on(name: string, listener: (data: any) => void): void {
  onMounted(() => {
    bus.on(name, listener)
  })
  onUnmounted(() => {
    bus.off(name, listener)
  })
}

async function emitCrossWindows(name: string, data?: any): Promise<void> {
  const json = JSON.stringify(data)
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
  emitCrossWindows,
  $on,
}
