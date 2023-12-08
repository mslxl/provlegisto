import MenuEventReceiver from "./menu-event"
import StatusRecover from "./status-recover"

export default function MainEventRegister() {
  return (
    <>
      <MenuEventReceiver />
      <StatusRecover />
    </>
  )
}
