import { atomWithSettings } from "."

export const keymapState = atomWithSettings("keymap", "normal")
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
