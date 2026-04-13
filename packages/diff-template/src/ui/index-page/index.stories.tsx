import type { Meta, StoryObj } from '@storybook/html'
import { AppDecorator } from '../../decorator/app-decorator'
import { mockBase } from '../../mock/base'

const meta: Meta = {
  title: '覆盖率总结页',
  decorators: [AppDecorator],
}

export default meta
type Story = StoryObj

export const normal: Story = {
  parameters: {
    app: {
      play() {
        mockBase()
      },
    },
  },
}
