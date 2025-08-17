import type { Meta, StoryObj } from '@storybook/html'
import { AppDecorator } from '../../../decorator/app-decorator'
import { mockBase, mockContentDetail } from '../../../mock/base'
import Source from './source.vue'
import { useRouter } from 'vue-router'
import { PrismRender } from './prism-render'

const meta: Meta = {
  title: '源码渲染',
  decorators: [AppDecorator],
}

export default meta
type Story = StoryObj

export const WithGitDiff: Story = {
  parameters: {
    app: {
      async play() {
        mockContentDetail()
      },
      component: () => {
        return <Source />
      },
    },
  },
}

export const WithoutGitDiff: Story = {
  parameters: {
    app: {
      async play() {
        mockBase()
        useRouter().replace({
          name: 'content-detail',
          query: {
            file: 'src/with-resolves.ts',
          },
        })
      },
      component: () => {
        return <Source />
      },
    },
  },
}

export const SinglePrismRenderStory: Story = {
  parameters: {
    app: {
      async play() {
        mockBase()
        useRouter().replace({
          name: 'content-detail',
          query: {
            file: 'src/with-resolves.ts',
          },
        })
      },
      component: PrismRender,
    },
  },
}
