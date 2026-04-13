import type { Meta, StoryObj } from '@storybook/html'
import { AppDecorator } from '../../decorator/app-decorator'
import { mockBase, mockContentDetail, mockSingleDirMode } from '../../mock/base'
import { useRouter } from 'vue-router'

const meta: Meta = {
  title: '源码页',
  decorators: [AppDecorator],
}

export default meta
type Story = StoryObj

export const gitDiff: Story = {
  parameters: {
    app: {
      play() {
        mockContentDetail()
      },
    },
  },
}
gitDiff.storyName = '有 gitdiff 情况'

export const withoutDiff: Story = {
  parameters: {
    app: {
      play() {
        mockBase()
        useRouter().replace({
          name: 'content-detail',
          query: {
            file: 'src/with-resolves.ts',
          },
        })
      },
    },
  },
}

withoutDiff.storyName = '全量覆盖率'

export const dirMode: Story = {
  parameters: {
    app: {
      play() {
        mockSingleDirMode()
        useRouter().replace({
          name: 'content-detail',
          query: {
            file: './with-resolves.ts',
          },
        })
      },
    },
  },
}

dirMode.storyName = '单目录模式，源码页'
