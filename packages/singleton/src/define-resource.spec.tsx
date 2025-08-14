import { describe, expect, it } from 'vitest'
import { defineResource } from './define-resource'
import { defineComponent, nextTick, reactive, shallowRef, watchEffect } from 'vue'
import { renderComponent } from '../test/render'
import { define } from './define-singleton'
import { delay } from '@cexoso/test-utils'
import { waitFor } from '@testing-library/dom'

describe('defineResource', () => {
  const useId = define(() => shallowRef(1))
  const useRemoteData = defineResource(() => {
    const id = useId()
    return () => {
      const requestId = id.value
      return Promise.resolve(requestId)
    }
  })
  const App = defineComponent({
    setup() {
      const remoteData = useRemoteData()
      return () => {
        const data = remoteData.data.value
        return <div>data: {data}</div>
      }
    },
  })

  it('在使用 useRemoteData 时，会发起请求并解开数据', async () => {
    const screen = renderComponent(App)
    await screen.findByText('data: 1')
  })

  it('依赖变更后，数据也会响应的变更', async () => {
    const screen = renderComponent(App)
    screen.play(() => {
      const id = useId()
      id.value = 10086
    })
    await screen.findByText('data: 10086')
  })

  it('轮询更新', async () => {
    let i = 0
    const useRemoteData = defineResource(
      () => () => {
        i += 1
        return Promise.resolve(i)
      },
      { interval: 10 }
    )
    const Child = defineComponent({
      props: { title: String },
      setup(props) {
        const remoteData = useRemoteData()
        return () => (
          <div role={props.title}>
            {props.title}: {remoteData.data.value}
          </div>
        )
      },
    })
    const useVisibles = define(() => reactive({ child1Visible: true, child2Visible: true }))
    const App = defineComponent({
      setup() {
        const visibles = useVisibles()
        return () => (
          <div>
            {visibles.child1Visible && <Child title="child1" />}
            {visibles.child2Visible && <Child title="child2" />}
          </div>
        )
      },
    })

    const screen = renderComponent(App)
    await screen.findByText('child1: 1')
    await screen.findByText('child1: 2') // 10ms 后会轮询更新
    expect(i).eq(2, '即使有两个组件，但是背后的数据源描述是同一个，所以只会调用两次')
    screen.play(() => (useVisibles().child1Visible = false))
    await nextTick()
    expect(screen.queryByRole('child1')).eq(null, 'child1 不再展示')
    // child2 仍然依赖着数据源，数据仍然轮询
    await screen.findByText('child2: 3')
    expect(i).eq(3, '此时请求调用了 3 次')
    // 现在不再有组件依赖数据源了
    screen.play(() => (useVisibles().child2Visible = false))
    await delay(100)
    expect(i).eq(3, '请求数仍是 3 次，因为没有组件依赖数据源，数据源也停止更新了')
  })

  it('isLoading 相关描述, 轮询时静默', async () => {
    const useId = define(() => {
      return shallowRef(0)
    })
    let requestCount = 0
    const useRemoteData = defineResource(
      () => {
        const id = useId()
        return () => {
          requestCount += 1
          return Promise.resolve(id.value)
        }
      },
      { interval: 10 }
    )
    let isLoadingCount = 0
    const App = defineComponent({
      setup() {
        const { isLoading } = useRemoteData()
        watchEffect(() => {
          if (isLoading.value) {
            isLoadingCount += 1
          }
        })
        return () => <div>{isLoading.value ? 'isLoading' : 'loaded'}</div>
      },
    })

    const screen = renderComponent(App)
    await screen.findByText('isLoading')
    await screen.findByText('loaded')
    await delay(100)
    expect(requestCount).eq(10, '轮询调用了 10 次')
    expect(isLoadingCount).eq(1, '但是只有一次 loading')
    screen.play(() => {
      useId().value = 2
    })
    await waitFor(() => expect(isLoadingCount).eq(2, '通过响应式数据变更导致的请求，isLoading 会变更'))
  })

  it('error 相关描述', async () => {
    const useId = define(() => shallowRef(0))
    let requestCount = 0
    let isReturnError = false
    const useRemoteData = defineResource(
      () => {
        const id = useId()
        return () => {
          requestCount += 1
          if (isReturnError) {
            return Promise.reject(new Error('error'))
          }
          return Promise.resolve(id.value)
        }
      },
      { interval: 10 }
    )
    const App = defineComponent({
      setup() {
        const { error } = useRemoteData()
        return () => {
          return <div>{error.value ? (error.value as Error).message : 'success'}</div>
        }
      },
    })

    const screen = renderComponent(App)
    await screen.findByText('success')
    isReturnError = true
    await delay(20)
    // 静默更新数据情况下，如果请求出错也不会把错误返回，而是会使用之前的数据
    // TODO: 这里是否要考虑明确错误如 network error，而不应该静默忽略掉所有的错误
    await screen.findByText('success')

    screen.play(() => {
      useId().value = 2
    })
    // 由响应式数据引发请求，错误会正确的抛给用户
    await screen.findByText('error')
  })

  it('数据竞态处理', async () => {
    const useId = define(() => shallowRef(0))
    let callCount = 0
    const useRemoteData = defineResource(
      () => {
        const id = useId()
        return async () => {
          callCount += 1
          let count = callCount
          if (id.value === 0) {
            return delay(20).then(() => count)
          }
          return Promise.resolve(count)
        }
      },
      { interval: 10 }
    )
    let result: number[] = []
    const App = defineComponent({
      setup() {
        const { data, isLoading } = useRemoteData()
        watchEffect(() => {
          if (!isLoading.value) {
            result.push(data.value)
          }
        })
        return () => {
          return <div>data: {data.value}</div>
        }
      },
    })

    const screen = renderComponent(App)
    await delay(20) // 20ms 后一条数据返回
    expect(result).deep.eq([1])
    await delay(15) // 15ms 后一条新的请求
    // 此时通过修改响应式数据主动发一次请求
    screen.play(() => {
      useId().value += 1
    })
    await delay(40)
    expect(result).deep.eq([1, 3, 4, 5, 6], '第二次请求， 延时 20ms 的，这个请求后返回时应该被丢弃')
  })
})
