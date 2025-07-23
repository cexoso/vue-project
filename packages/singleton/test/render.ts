import { Component, createApp } from 'vue'
import { createContainer } from './create-container'
import { within } from '@testing-library/dom'

export const renderComponent = (component: Component) => {
  const app = createApp(component)
  const container = createContainer()
  app.mount(container)
  return within(container)
}
