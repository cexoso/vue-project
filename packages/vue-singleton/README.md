# singleton

@cexoso/vue-singleton provide define function that you can use it to define shared variable between component, and isolate between vue application.

# install

pnpm i @cexoso/vue-singleton -S

# demo

## bootstrap

your should use Context in your createApp setup, like this:

```typescript
import { createContext } from '@cexoso/vue-singleton'

const app = createApp(component)
app.use(createContext()).mount(container)
```

All define instance are save at this context;

define use case

```typescript
// declaration
import { define } from '@cexoso/vue-singleton'

const useCount = define(() => ref(0))
const useIncrease = () => {
  const count = useCount()
  return () => count.value++
}

// use in Vue component
const App = defineComponent({
  setup() {
    const count = useCount()
    return () => (
      <div>
        <div>count: {count.value}</div>
        <Button />
      </div>
    )
  },
})

const Button = defineComponent({
  setup() {
    const inscrease = useIncrease()
    return () => <button onClick={inscrease}>点击新增</button>
  },
})
```

`const count = useCount()` and `const inscrease = useIncrease()` visit the same count instance, this feature let you can share state between component;

if you create another application, the Count state in two application are difference, this feature let test for app easy.

# API

## defineResource

defineResource serves to define a data resource，and it's features are:

- share data resource between component or hooks

```typescript
import { define, defineResource } from '@cexoso/vue-singleton'

const useId = define(() => shallowRef(1))
const useRemoteData = defineResource(() => {
  const id = useId()
  return async () => {
    const requestId = id.value
    // mock request
    return delay(20).then(() => requestId)
  }
})
const Child1 = defineComponent(() => {
  const data = useRemoteData()
  return () => <div>{data.data.value}</div>
})
const Child2 = defineComponent(() => {
  const data = useRemoteData()
  return () => <div>{data.data.value}</div>
})
const App = defineComponent(() => {
  return () => (
    <div>
      <Child1 />
      <Child2 />
    </div>
  )
})
```

Child1 and Child2 share the same resource.

- pull mode, not push mode

you only need to consider how to describe the data source, without taking into account when or where to call it, useData hooks will call the request at the appropriate time.

- polling mode

useData provides a polling mode, where polling starts when data is needed(setup) and stops when data is no longer needed(onMounted).

## parameters

| parameter | describe                                                                         | default value          |
| --------- | -------------------------------------------------------------------------------- | ---------------------- |
| interval  | The data source will make requests at pulling mode                               | undefined (no pulling) |
| retain    | "retain" indicates whether stale data is retained when an active request called. | false                  |
| retry     | "retry" indicates whether retry (count) request when a active request failed     | 0                      |
