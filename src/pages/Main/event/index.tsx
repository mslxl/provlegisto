import CacheLoader from "./cache-loader"
import MenuEventReceiver from "./menu-event"

export default function MainEventRegister() {
  return (
    <>
      <MenuEventReceiver />
      <CacheLoader />
      {/* <StatusRecover /> */}
    </>
  )
}
