import { describe, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { renderComponent } from '../test/render'
import { define } from './define-singleton'
import { fireEvent } from '@testing-library/dom'

const useCount = define(() => ref(0))
const useIncrease = () => {
  const count = useCount()
  return () => count.value++
}

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

describe('define', () => {
  it('define 可以定义共享变量', async () => {
    const { getByText, findByText, app } = renderComponent(App)
    await findByText('count: 0')
    fireEvent.click(getByText('点击新增'))
    await findByText('count: 1')
    app.runWithContext(() => {
      const count = useCount()
      count.value = 10
    })
    await findByText('count: 10')
  })
  it('不同的 app 之间是隔离的，不会相互影响', async () => {
    // 创建了一个 App，通过操作修改了 count 的值
    const screen = renderComponent(App)
    fireEvent.click(screen.getByText('点击新增'))

    // 再创建一个 App 进行测试
    const screen1 = renderComponent(App)
    // 新建的 App 仍然展示的是 count: 0，因为状态在 App 之间隔离
    screen1.getByText('count: 0')
  })
})
