import { createMemoryHistory } from 'vue-router'
import { renderContainer, type RenderContainerOptions } from './render-base'
import { within } from '@testing-library/dom'
import App from '../app.vue'
import { defineComponent } from 'vue'

export const EmptyPlayground = defineComponent({
  setup() {
    return () => {
      return null
    }
  },
})

let div: HTMLDivElement | undefined
const createSingletonContainer = () => {
  div = createContainer()
  return div
}

export function renderTest(opts: Pick<RenderContainerOptions, 'container' | 'component' | 'play'>) {
  const memoryHistory = createMemoryHistory()

  const container = opts.container ?? createSingletonContainer()

  return renderContainer({
    ...opts,
    history: memoryHistory,
    container,
  })
}

let containerElement: Element | null = null

export function createContainer() {
  const innerDiv = document.createElement('div')
  innerDiv.style.width = '100%'
  innerDiv.style.height = '100%'
  innerDiv.style.display = 'flex'
  return innerDiv
}
function createAndAppend() {
  cleanup()
  const inndeDiv = createContainer()
  document.body.appendChild(inndeDiv)
  containerElement = inndeDiv
  return inndeDiv
}

/**
 * @description 用于单元测试渲染测试用例
 */
export async function renderTestApp(opts?: Partial<Pick<RenderContainerOptions, 'component' | 'play'>>) {
  const innerDiv = createAndAppend()
  const app = await renderTest({
    container: innerDiv,
    component: opts?.component ?? App,
    play: opts?.play,
  })

  return {
    ...within(innerDiv),
    unmount() {
      app.unmount()
    },
    play<T>(fn: () => T) {
      return app.runWithContext(fn)
    },
  }
}

export function cleanup() {
  if (containerElement !== null) {
    containerElement.parentElement?.removeChild(containerElement)
  }
}
