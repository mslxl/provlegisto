import {z} from 'zod'
import { atomWithSettings } from '.'

export const collabConnectFormSchema = z.object({
  p2p: z.boolean(),
  server: z.string().startsWith("ws://").or(z.string().startsWith("wss://")),
  username: z.string().min(5).max(20),
  password: z.string().min(8).max(128),
  roomName: z.string().min(5).max(20),
})

export const lastConnectFormAtom = atomWithSettings<z.infer<typeof collabConnectFormSchema> | {}>('last.connect', {})