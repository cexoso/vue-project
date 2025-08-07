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
