import { describe, it } from 'vitest'
import { renderComponent } from '../test/render'
import { define } from './define-singleton'
import { fireEvent } from '@testing-library/dom'

const useCount = define(() => 0)
const useIncrease = () => {
  const [count, setCount] = useCount()
  return () => setCount(count + 1)
}

const useDoubleCount = () => {
  const [count] = useCount()
  return count * 2
}

const App = () => {
  const count = useDoubleCount()
  return (
    <div>
      <div>count: {count}</div>
      <Button />
    </div>
  )
}

const Button = () => {
  const inscrease = useIncrease()
  return <button onClick={inscrease}>点击新增</button>
}

describe('define', () => {
  it('define 可以定义共享变量', async () => {
    const screen = renderComponent(App)
    await screen.findByText('count: 0')
    fireEvent.click(screen.getByText('点击新增'))
    await screen.findByText('count: 2')

    screen.play(() => {
      const [_count, setCount] = useCount()
      return () => setCount(10)
    })

    await screen.findByText('count: 20')
  })
  it('不同的 app 之间是隔离的，不会相互影响', async () => {
    // 创建了一个 App，通过操作修改了 count 的值
    const screen = renderComponent(App)
    await screen.findByText('count: 0')
    fireEvent.click(screen.getByText('点击新增'))

    // 再创建一个 App 进行测试
    const screen1 = renderComponent(App)
    // 新建的 App 仍然展示的是 count: 0，因为状态在 App 之间隔离
    await screen1.findByText('count: 0')
  })
})
