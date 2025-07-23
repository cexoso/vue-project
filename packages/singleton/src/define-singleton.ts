import { useContext } from './context'

/**
 * @description 可以用于定义应用级单例
 */
export function define<T>(factory: () => T) {
  const useHooks = () => {
    const { store } = useContext()
    let cacheValue = store.get(useHooks)
    if (cacheValue === undefined) {
      const init = factory()
      cacheValue = init
      store.set(useHooks, cacheValue)
    }
    return cacheValue as T
  }
  return useHooks
}
