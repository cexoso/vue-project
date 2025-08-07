import { useContext } from './context'
import { effectScope } from 'vue'

/**
 * @description 可以用于定义应用级单例
 */
export function define<T>(factory: () => T) {
  const useHooks = () => {
    const { store } = useContext()
    let item = store.get(useHooks)
    if (item === undefined) {
      const scope = effectScope(true)
      scope.run(() => {
        item = { cacheValue: factory(), scope }
        store.set(useHooks, item)
      })
    }
    return item!.cacheValue as T
  }
  return useHooks
}
