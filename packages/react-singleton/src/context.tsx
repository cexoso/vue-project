import {
  createContext as createReactContext,
  useContext as useReactContext,
  useRef,
  FC,
  ReactNode,
} from 'react'

const reactContext = createReactContext<Context | null>(null)

type Hooks = () => unknown
type Store = Map<Hooks, unknown>

export interface Context {
  store: Store
}

export const useContext = () => {
  const context = useReactContext(reactContext)
  if (context === null) {
    const message = 'TODO'
    throw new Error(message)
  }
  return context
}

export const Provider: FC<{
  children?: ReactNode
}> = (props) => {
  const ref = useRef({
    store: new Map(),
  })
  return <reactContext.Provider value={ref.current}>{props.children}</reactContext.Provider>
}
