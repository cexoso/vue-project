import type { Method } from '@cexoso/ff-server'
import Axios from 'axios'
import { ResponseInterceptors } from './type'

type WrapMethod<T> = T extends (args: unknown) => infer R ? () => R : T

type Client<T extends { [key: string]: Method<any, any> }> = {
  [key in keyof T]: WrapMethod<T[key]['method']>
}

interface Options {
  responseInterceptors?: ResponseInterceptors[]
}

export const createRpcClient = <T extends { [key: string]: Method<any, any> }>(opts?: Options) => {
  const axios = Axios.create()
  if (opts?.responseInterceptors) {
    opts?.responseInterceptors.forEach((interceptor) => {
      axios.interceptors.response.use(interceptor)
    })
  }
  return new Proxy(
    {},
    {
      get: (_target: any, namespace: string, _receiver: any) => {
        return async (input: any) => {
          return axios
            .post(`/api/${namespace}`, {
              payload: input,
            })
            .then((res) => {
              if (res.data.code !== 0) {
                return Promise.reject(res.data)
              }
              return res.data.data
            })
        }
      },
    }
  ) as Client<T>
}
