import clsx from "clsx"
import { FaConnectdevelop } from "react-icons/fa6"
import { Button } from "../ui/button"
import { useSetAtom } from "jotai"
import { disconnectProviderAtom } from "@/store/source/provider"
import { motion } from "framer-motion"

interface ConnectingProps {
  className?: string
}

export default function Connecting(props: ConnectingProps) {
  const disconnect = useSetAtom(disconnectProviderAtom)

  return (
    <div
      className={clsx(props.className, "h-full select-none flex flex-col min-h-0 min-w-0 items-center justify-center gap-6")}
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ ease: "linear", duration: 5, repeat: Infinity, repeatDelay: 0, repeatType: "loop" }}
      >
        <FaConnectdevelop className="w-16 h-16"/>
      </motion.div>
      <p>Connecting</p>
      <Button size="sm" variant="destructive" onClick={disconnect}>
        Cancel
      </Button>
    </div>
  )
}
