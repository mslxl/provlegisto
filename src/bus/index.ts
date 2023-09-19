import mitt from "mitt"
const bus = mitt()
bus.on("*", (type, e) => {
  console.log("bus <- ", type, e)
})
export default bus
