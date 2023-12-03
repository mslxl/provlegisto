import { motion } from "framer-motion"
import LogoImage from "../../../src-tauri/icons/128x128@2x.png"
export default function Logo() {
  return (
    <motion.div
      initial={{
        y: -60,
      }}
      animate={{
        y: 0,
      }}
      className="flex items-center content-center self-center justify-self-center flex-wrap"
    >
      <img className="w-32 h-32 object-cover mx-8" src={LogoImage} />
      <div className="my-4">
        <h3 className="font-bold text-2xl">Provlegisto</h3>
        <span>The simple IDE specially designed for ACMer/OIer</span>
      </div>
    </motion.div>
  )
}
