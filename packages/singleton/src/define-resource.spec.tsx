import { describe, expect, it } from 'vitest'
import { defineResource } from './define-resource'
import { defineComponent, nextTick, reactive, shallowRef, watch, watchEffect } from 'vue'
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
})
