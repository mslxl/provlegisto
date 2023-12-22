import { collabCookieAtom, collabSignalingServerAtom } from "@/store/setting/collab"
import axios from "axios"
import { useRef, useState } from "react"
import { useAtomValue } from "jotai"
import { axiosTauriApiAdapter } from "axios-tauri-api-adapter"

export function useSignalServerAxios() {
  const baseURL = useAtomValue(collabSignalingServerAtom)
  const cookie = useAtomValue(collabCookieAtom)
  const reqCnt = useRef(0)
  const [loading, setLoading] = useState(false)
  const client = axios.create({
    baseURL,
    timeout: 6000,
    withCredentials: true,
    adapter: axiosTauriApiAdapter,
    headers: {
      Cookie: cookie,
    },
    validateStatus: (status) => status < 502,
  })
  client.interceptors.request.use((cfg) => {
    reqCnt.current++
    if (reqCnt.current > 0) setLoading(true)
    return cfg
  })
  client.interceptors.response.use(
    (cfg) => {
      reqCnt.current--
      if (reqCnt.current == 0) setLoading(false)
      return cfg
    },
    (err) => {
      reqCnt.current--
      if (reqCnt.current == 0) setLoading(false)
      let data = {
        data: {
          status: -1,
          error: err.toString(),
        },
      }
      return data
    },
  )

  return {
    axios: client,
    loading,
  }
}
