import MenuEventReceiver from "./menu-event"
import useAutoSaveLoader from "./useAutoSaveLoader"

export default function MainEventRegister() {
  useAutoSaveLoader()
  return (
    <>
      <MenuEventReceiver />
      {/* <StatusRecover /> */}
    </>
  )
}
