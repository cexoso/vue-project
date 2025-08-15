import { Component, createApp, App } from 'vue'
import { within } from '@testing-library/dom'
import { createContext } from '../src/context'

let div: HTMLDivElement | undefined
const createContainer = () => {
  if (div !== undefined) {
    clean()
  }
  div = document.createElement('div')
  return div
}

const clean = () => {
  if (div) {
    const parent = div.parentElement
    parent?.removeChild(div)
    const app = wm.get(div)
    app?.unmount()
  }
}

const wm = new WeakMap<HTMLDivElement, App<Element>>()

export const renderComponent = (component: Component) => {
  const app = createApp(component)
  const container = createContainer()
  app.use(createContext()).mount(container)
  wm.set(container, app)
  return {
    ...within(container),
    app,
    play<T>(cb: () => T) {
      return app.runWithContext(cb)
    },
  }
}
