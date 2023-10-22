import bus from "../bus"
export interface NotifyBusMsg {
  title: string
  content: string
}

function wrapNotify(ty: string): (message: NotifyBusMsg) => void {
  return (message: NotifyBusMsg) => {
    bus.emit(`notify:${ty}`, message)
  }
}

export const info = wrapNotify("info")
export const success = wrapNotify("success")
export const warning = wrapNotify("warning")
export const error = wrapNotify("error")
