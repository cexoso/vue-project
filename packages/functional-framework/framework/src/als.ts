import { AsyncLocalStorage } from 'node:async_hooks'
import { Context } from 'koa'

const storage = new AsyncLocalStorage<Context>()
export const appScopeServiceMapSymbol = Symbol()

export const run = (ctx: Context, callback: () => any) => {
  return storage.run(ctx, () => callback())
}

export const getStore = () => {
  const store = storage.getStore()
  if (store === null || store === undefined) {
    throw new Error('getStore hooks must call under run')
  }
  return store
}
