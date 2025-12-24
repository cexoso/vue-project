import {
  defineComponent,
  EffectScope,
  Plugin,
  inject,
  provide,
  onUnmounted,
  Component,
  createVNode,
} from 'vue'

export const ContextKey = Symbol()

type Hooks = () => unknown
type Store = Map<
  Hooks,
  {
    cacheValue: unknown
    scope: EffectScope
  }
>

export interface Context {
  store: Store
}

function useRawContext() {
  return inject<ContentStore | undefined>(ContextKey, undefined)
}

export const useContext = (useRoot?: boolean) => {
  const context = useRawContext()
  const message =
    'The possible reasons for the current error are: \n' +
    '1) You need to use use(createContext()) to create a context when creating the app\n' +
    '2) Hooks functions can only be called within the setup function.'
  if (context === undefined) {
    throw new Error(message)
  }
  if (!useRoot || context.type === 'root') {
    return context
  }
  const { root } = context
  if (root === undefined) {
    throw new Error(message)
  }
  return root
}

interface ContentStore {
  store: Store
  root: ContentStore | undefined
  type: 'root' | 'child'
}

function createContextStore(root?: ContentStore, type?: 'root' | 'child') {
  const store: Store = new Map()

  return {
    store,
    root,
    type: type ?? 'root',
  }
}

export const createContext = (): Plugin => {
  return {
    install(app) {
      const context = createContextStore() // Root
      const originUnmount = app.unmount
      app.unmount = () => {
        for (const { scope } of context.store.values()) {
          scope.stop() // 在 app 卸载的时候，需要关掉 scope，让 effect 和依赖追踪释放
        }
        return originUnmount.apply(app)
      }
      app.provide<Context>(ContextKey, context)
    },
  }
}

export const Context = defineComponent({
  setup(_, context) {
    // 在挂载 provide 前，先往 root 上去查找
    const maybeContext = useContext(true)
    const contextStore = createContextStore(maybeContext, 'child')
    provide(ContextKey, contextStore)
    onUnmounted(() => {
      for (const { scope } of contextStore.store.values()) {
        scope.stop() // 在 app 卸载的时候，需要关掉 scope，让 effect 和依赖追踪释放
      }
    })
    return () => {
      return context.slots['default'] ? context.slots['default']() : null
    }
  },
})

export const WithContext = (loadComponent: () => Promise<{ default: Component }>) => () =>
  loadComponent().then(({ default: Component }) => ({
    default: defineComponent({
      setup() {
        return () => createVNode(Context, {}, () => createVNode(Component))
      },
    }),
  }))
