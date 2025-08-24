import { useState, useEffect } from 'react'
import { useContext } from './context'
import { BehaviorSubject } from 'rxjs'

export function define<T>(factory: () => T) {
  const useHooks = () => {
    const { store } = useContext()
    let behaviorSubject = store.get(useHooks) as BehaviorSubject<T>
    if (behaviorSubject === undefined) {
      const initValue = factory()
      behaviorSubject = new BehaviorSubject(initValue)
      store.set(useHooks, behaviorSubject)
    }
    const [state, setState] = useState(behaviorSubject.value)
    // rxjs 值同步给 react
    useEffect(() => {
      const subscription = behaviorSubject.subscribe(setState)
      return () => subscription.unsubscribe()
    }, [])
    return [
      state,
      (value: T) => {
        // 更新值时通知 rxjs
        behaviorSubject.next(value)
      },
    ] as const
  }
  return useHooks
}
