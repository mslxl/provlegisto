import { Extension } from "@codemirror/state"

export type KeymapProvider = () => Promise<Extension>

export const noKeymap: KeymapProvider = async () => []

export const vimKeymap: KeymapProvider = async () => [(await import("@replit/codemirror-vim")).vim()]

export const emacsKeymap: KeymapProvider = async () => [(await import("@replit/codemirror-emacs")).emacs()]
