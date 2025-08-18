import type { Meta, StoryObj } from '@storybook/html'
import { AppDecorator } from './decorator/app-decorator'
import { mockBase, mockGCMExample, mockGitDiff, mockSingleDirMode } from './mock/base'
import { useRouter } from 'vue-router'

const meta: Meta = {
  title: '应用',
  decorators: [AppDecorator],
}

export default meta
type Story = StoryObj

export const app: Story = {
  parameters: {
    app: {
      play() {
        mockBase()
      },
    },
  },
}
app.storyName = '全量覆盖率'

export const withGitDiff: Story = {
  parameters: {
    app: {
      play() {
        mockGitDiff()
      },
    },
  },
}

withGitDiff.storyName = '增量覆盖率演示'

export const DirMode: Story = {
  parameters: {
    app: {
      play() {
        mockSingleDirMode()
      },
    },
  },
}

DirMode.storyName = '全量类型覆盖，仅一层目录模式'

export const GCMDemo: Story = {
  parameters: {
    app: {
      play() {
        mockGCMExample()
        useRouter().replace({
          name: 'content-detail',
          query: { file: './a.ts' },
        })
      },
    },
  },
}

GCMDemo.storyName = 'gcm demo'
