import { Plugin, inject } from 'vue'

export const ContextKey = Symbol()

type Hooks = () => unknown
type Store = Map<Hooks, unknown>

export interface Context {
  store: Store
}

export const useContext = () => {
  const context = inject<Context>(ContextKey)
  if (context === undefined) {
    const message =
      'The possible reasons for the current error are: \n' +
      '1) You need to use use(createContext()) to create a context when creating the app\n' +
      '2) Hooks functions can only be called within the setup function.'
    throw new Error(message)
  }
  return context
}

export const createContext = (): Plugin => {
  return {
    install(app) {
      app.provide<Context>(ContextKey, {
        store: new Map(),
      })
    },
  }
}
