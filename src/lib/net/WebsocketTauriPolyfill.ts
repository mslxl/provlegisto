import TauriWebSocket from "tauri-plugin-websocket-api"

/**
 * Rough implement that redirect websocket to rust via tauri plugin
 */
class WebsocketTauriPolyfill implements WebSocket {
  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSED = 3
  readonly CLOSING = 2
  binaryType: BinaryType = "arraybuffer"

  readonly bufferedAmount: number = 0
  readonly extensions: string = ""
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null
  onerror: ((this: WebSocket, ev: Event) => any) | null = null // This function would not be invoked in here
  onmessage: ((this: WebSocket, ev: MessageEvent<any>) => any) | null = null
  onopen: ((this: WebSocket, ev: Event) => any) | null = null
  ws: TauriWebSocket | null = null
  protocol: string = "ws"
  readonly url: string
  readyState: number = this.CLOSED

  constructor(url: string| URL, _protocols: string | string[] | undefined) {
    if(typeof url == 'string'){
      this.url = url
      if(url.startsWith("ws://")) this.protocol = "ws"
      else if(url.startsWith("wss://")) this.protocol = "wss"
      else this.protocol = "ws"
    }else{
      this.url = url.toString()
      this.protocol = url.protocol
    }
    this.readyState = this.CONNECTING
    TauriWebSocket.connect(url.toString()).then((ws) => {
      this.onopen && this.onopen(new Event("open"))
      this.openListener.forEach((v) => v.call(this, new Event("open")))
      ws.addListener((msg) => {
        if (msg.type == "Close") {
          this.readyState = this.CLOSED
          // this.onerror && this.onerror)

          const ev = new CloseEvent("close", { code: msg.data?.code, reason: msg.data?.reason })
          this.onclose && this.onclose(ev)
          this.closeListener.forEach((v) => v.call(this, ev))
        } else {
          this.readyState = this.OPEN
          if (msg.type == "Text") {
            let event = new MessageEvent<string>("message", {
              data: msg.data,
            })
            this.onmessage && this.onmessage(event)
            this.messageListener.forEach((v) => v.call(this, event))
          } else if (msg.type == "Binary") {
            const data = new Uint8Array(msg.data)
            let event = new MessageEvent<Uint8Array>("message", {
              data: data,
            })
            this.onmessage && this.onmessage(event)
            this.messageListener.forEach((v) => v.call(this, event))
          }
        }
      })
      this.ws = ws
    })
  }
  close(): void {
    this.ws?.disconnect()
  }

  send(data: string | ArrayBufferLike | Blob | Uint8Array): void {
    if (typeof data == "string") {
      this.ws?.send(data)
    } else if (data instanceof Blob) {
      data.arrayBuffer().then((buff) => this.send(buff))
    } else if (data instanceof ArrayBuffer) {
      this.send(new Int8Array(data))
    } else if (data instanceof Int8Array || data instanceof Uint8Array) {
      this.ws?.send(Array.from(data))
    }else{
      console.log(data)
      throw new Error("Unsupported data type")
    }
  }

  closeListener = new Set<(this: WebSocket, ev: WebSocketEventMap["close"]) => any>()
  openListener = new Set<(this: WebSocket, ev: WebSocketEventMap["open"]) => any>()
  messageListener = new Set<(this: WebSocket, ev: WebSocketEventMap["message"]) => any>()

  addEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    _options?: boolean | AddEventListenerOptions | undefined,
  ): void {
    switch (type) {
      case "close":
        this.closeListener.add(listener as any)
        break
      case "message":
        this.closeListener.add(listener as any)
        break
      case "open":
        this.openListener.add(listener as any)
        break
    }
  }
  removeEventListener<K extends keyof WebSocketEventMap>(
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    _options?: boolean | EventListenerOptions | undefined,
  ): void {
    switch (type) {
      case "close":
        this.closeListener.delete(listener as any)
        break
      case "message":
        this.closeListener.delete(listener as any)
        break
      case "open":
        this.openListener.delete(listener as any)
        break
    }
  }
  dispatchEvent(event: Event): boolean {
    switch (event.type) {
      case "close":
        this.closeListener.forEach((v) => v.call(this, event as any))
        return true
      case "message":
        this.messageListener.forEach((v) => v.call(this, event as any))
        return true
      case "open":
        this.openListener.forEach((v) => v.call(this, event as any))
        return true
    }
    return false
  }
}

export default WebsocketTauriPolyfill
