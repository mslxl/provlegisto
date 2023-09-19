import mitt from "mitt"
const bus = mitt()
bus.on("*", (type, e) => {
  console.log(type, e)
})
export default bus
