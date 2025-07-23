import { Component, createApp } from 'vue'
import { createContainer } from './create-container'
import { within } from '@testing-library/dom'
import { createContext } from '../src/context'

export const renderComponent = (component: Component) => {
  const app = createApp(component)
  const container = createContainer()
  app.use(createContext()).mount(container)
  return {
    ...within(container),
    app,
  }
}
