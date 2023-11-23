import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { BsBalloon, BsBalloonHeart } from "react-icons/bs"

export default function Loading() {
  const [balloonType, setBalloonType] = useState(0)

  useEffect(() => {
    if (Math.random() < 0.5) setBalloonType(1)
    else setBalloonType(0)
  }, [])

  return (
    <div className="flex-1 h-full w-full flex items-center content-center">
      <div className="p-8 flex">
        <motion.div
          animate={{ y: [30, -30] }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          {balloonType == 0 ? (
            <BsBalloon className="h-16 w-16 text-red-600" />
          ) : (
            <BsBalloonHeart className="h-16 w-16 text-red-600" />
          )}
        </motion.div>
        <h3 className="text-2xl font-semibold">
          {balloonType == 0 ? "Getting more balloon..." : "Getting first blood..."}
        </h3>
      </div>
    </div>
  )
}
