import { JSONRPCError } from "@open-rpc/client-js"
import { ERR_UNKNOWN } from "@open-rpc/client-js/build/Error"
import { JSONRPCRequestData, getBatchRequests, getNotifications } from "@open-rpc/client-js/build/Request"
import { Transport } from "@open-rpc/client-js/build/transports/Transport"
import WebSocket from "tauri-plugin-websocket-api"

/**
 * Original WebSocket Transport can not run on tauri secure context
 * But this one can do it!
 */
class TauriWSTransport extends Transport {
  public connection: WebSocket | null = null
  public uri: string
  public constructor(uri: string) {
    super()
    this.uri = uri
  }

  public async connect(): Promise<any> {
    this.connection = await WebSocket.connect(this.uri)
    this.connection.addListener((message) => {
      let data = (message.data as string)
      this.transportRequestManager.resolveResponse(data)
    })
  }
  public close(): void {
    this.connection?.disconnect()
  }
  public async sendData(data: JSONRPCRequestData, timeout: number | null = 5000): Promise<any> {
    let prom = this.transportRequestManager.addRequest(data, timeout)
    const notifications = getNotifications(data)
    try {
      await this.connection!.send(JSON.stringify(this.parseData(data)))
      this.transportRequestManager.settlePendingRequest(notifications)
    } catch (err) {
      const jsonError = new JSONRPCError((err as any).message, ERR_UNKNOWN, err)

      this.transportRequestManager.settlePendingRequest(notifications, jsonError)
      this.transportRequestManager.settlePendingRequest(getBatchRequests(data), jsonError)

      prom = Promise.reject(jsonError)
    }
    return prom
  }
}

export default TauriWSTransport