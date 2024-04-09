import { z } from "zod"
import { atomWithSettings } from "."

export const collabConnectFormSchema = z.object({
  p2p: z.boolean(),
  server: z.string().startsWith("ws://").or(z.string().startsWith("wss://")),
  username: z.string().min(5).max(20),
  password: z.string().min(8).max(128),
  roomName: z.string().min(5).max(20),
  color: z.string().regex(/^([\d(a-f)(A-F)]{3}){1,2}$/, { message: "String must be a valid color" }),
})

export const lastConnectFormAtom = atomWithSettings<z.infer<typeof collabConnectFormSchema> | null>(
  "last.connect",
  null,
)
