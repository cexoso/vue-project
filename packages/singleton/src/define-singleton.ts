import { getCurrentInstance, type AppContext } from 'vue'

type Hooks = () => unknown
type CacheMap = Map<Hooks, unknown>

const appMap = new WeakMap<AppContext, CacheMap>()
const getCache = (app: AppContext, key: Hooks) => {
  const map = appMap.get(app)
  if (map === undefined) {
    appMap.set(app, new Map())
    return undefined
  }
  return map.get(key)
}
const setCache = (app: AppContext, key: Hooks, value: unknown) => {
  let map = appMap.get(app)
  if (map === undefined) {
    map = new Map()
  }
  map.set(key, value)
}
const getContext = () => {
  const vm = getCurrentInstance()
  if (vm === null) {
    throw new Error('hooks must be used in setup function')
  }
  return vm.appContext
}

/**
 * @description 可以用于定义应用级单例
 */
export function define<T>(factory: () => T) {
  const useHooks = () => {
    const app = getContext()
    let cacheValue = getCache(app, useHooks)
    if (cacheValue === undefined) {
      const init = factory()
      cacheValue = init
      setCache(app, useHooks, cacheValue)
    }
    return cacheValue as T
  }
  return useHooks
}
