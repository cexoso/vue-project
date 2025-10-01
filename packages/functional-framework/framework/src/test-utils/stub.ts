import { getStore } from '../als'
import { Factory, getServiceMap } from '../hooks/define'
export const mockService = <T>(factory: Factory<T>, value: T) => {
  const context = getStore()
  const map = getServiceMap(context)
  map.set(factory, value)
}
