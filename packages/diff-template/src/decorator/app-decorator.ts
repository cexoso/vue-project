import type { Decorator } from '@storybook/html'
import type { Component } from 'vue'
import { createContainer } from './create-container'
import App from '../app.vue'
import { renderTest } from '../render-app/render-test'

type Play = () => void

interface AppDecoratorParameters {
  /**
   * @description 在渲染真实的组件前，可以使用 play 勾子提前执行逻辑
   */
  play?: Play
  /**
   * @description story 渲染哪个 vue 组件
   */
  component?: Component
}

declare module '@storybook/html' {
  interface Parameters {
    app?: AppDecoratorParameters
  }
}

export const AppDecorator: Decorator = (_story, config) => {
  const appConfig = config.parameters.app
  const component = appConfig?.component ?? App
  const play = appConfig?.play

  const container = createContainer()
  renderTest({ container, component, play })
  return container
}
