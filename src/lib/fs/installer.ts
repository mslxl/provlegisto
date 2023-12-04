import { execuatePwshScript } from "../ipc/setup"

type Msys2Report = {
  gcc: string
  clangd: string
}
export async function installMsys2(): Promise<Msys2Report> {
  return execuatePwshScript("msys2").then((res) => JSON.parse(res))
}
