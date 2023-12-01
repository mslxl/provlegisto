import { atom } from "jotai"
import { atomWithSettings } from "."
import { emacsKeymap, noKeymap, vimKeymap } from "@/components/codemirror/keymap"

export const keymapStateAtom = atomWithSettings("keymap", "normal")
export const keymapValues = [
  {
    key: "normal",
    value: "Normal",
  },
  {
    key: "vim",
    value: "Vim",
  },
  {
    key: "emacs",
    value: "Emacs",
  },
]

export const keymapExtensionAtom = atom(async (get)=> {
  const keymapName = await get(keymapStateAtom)
  if (keymapName == "vim") return await vimKeymap()
  else if (keymapName == "emacs") return await emacsKeymap()
  return await noKeymap()
})