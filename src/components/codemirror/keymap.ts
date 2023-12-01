import { Extension } from "@codemirror/state"

export type KeymapProvider = () => Promise<() => Extension>

export const noKeymap: KeymapProvider = async () => () => []

export const vimKeymap: KeymapProvider = () => import("@replit/codemirror-vim").then((v) => () => [v.vim()])

export const emacsKeymap: KeymapProvider = () => import("@replit/codemirror-emacs").then((e) => () => [e.emacs()])
