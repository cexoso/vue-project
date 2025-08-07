import { describe, expect, it } from 'vitest'
import { defineComponent, ref, watchEffect, effect } from 'vue'
import { renderComponent } from '../test/render'
import { define } from './define-singleton'
import { fireEvent } from '@testing-library/dom'

// 根据 id 获取 data, 模拟一个异步接口
const getDataById = async (id: number) => {
  return Promise.resolve(id)
}

const useId = define(() => ref(0))
const useData = define(() => {
  const id = useId()
  const result = ref()
  watchEffect(
    () => {
      getDataById(id.value).then((data: any) => {
        result.value = data
      })
    },
    { flush: 'post' }
  )
  return result
})

const useIncrease = () => {
  const id = useId()
  return () => id.value++
}

const App = defineComponent({
  setup() {
    const id = useId()
    const firstVisible = ref(true)
    const deleteFirst = () => {
      firstVisible.value = false
    }
    return () => (
      <div>
        <div>id: {id.value}</div>
        {firstVisible.value && <First />}
        <Second />
        <Button />
        <button onClick={deleteFirst}>点击删除</button>
      </div>
    )
  },
})
const First = defineComponent({
  setup() {
    const data = useData()
    return () => <div>data: {data.value}</div>
  },
})
const Second = defineComponent({
  setup() {
    const data = useData()
    return () => <div>Second data: {data.value}</div>
  },
})
const Button = defineComponent({
  setup() {
    const inscrease = useIncrease()
    return () => <button onClick={inscrease}>点击新增</button>
  },
})

describe('可以用于定义数据源', () => {
  it('define 可以定义共享变量', async () => {
    const { findByText, getByText } = renderComponent(App)
    await findByText('Second data: 0')
    fireEvent.click(getByText('点击新增'))
    await findByText('Second data: 1')
    fireEvent.click(getByText('点击删除'))
    fireEvent.click(getByText('点击新增'))
    await findByText('Second data: 2')
  })
  it('define 创建的内容生命周期跟 vue app', async () => {
    let hasClean = false
    const useXXX = define(() => {
      effect(() => {}, {
        onStop() {
          hasClean = true
        },
      })
      return ref(1)
    })
    const App = defineComponent({
      setup() {
        const id = useXXX()
        return () => <div>{id.value}</div>
      },
    })
    const { app, findByText } = renderComponent(App)
    await findByText('1')
    app.unmount()
    expect(hasClean).eq(true, 'App 卸载会调用 effect stop 从而清除记录的副作用和依赖追踪')
  })
})
