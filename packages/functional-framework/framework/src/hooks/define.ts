import { Context } from 'koa'
import { getStore, appScopeServiceMapSymbol } from '../als'

export type Factory<T> = () => T
const ctxMap = new WeakMap<Context, WeakMap<Factory<unknown>, unknown>>()

export function getServiceMap(ctx: Context) {
  let serviceMap = ctxMap.get(ctx)
  if (serviceMap === undefined) {
    serviceMap = new WeakMap()
    ctxMap.set(ctx, serviceMap)
  }
  return serviceMap
}

/**
 * @description define 的作用是在一个 ctx 中保证单实例
 */
export function defineService<T>(factory: Factory<T>, scope: 'app' | 'request' = 'request') {
  function factoryOne() {
    const ctx = getStore()
    const serviceMap = scope === 'app' ? ctx[appScopeServiceMapSymbol] : getServiceMap(ctx)
    let result = serviceMap.get(factoryOne)
    if (result === undefined) {
      result = factory()
      serviceMap.set(factoryOne, result)
    }
    return result as T
  }
  return factoryOne
}
