import type { Component } from 'vue'

import type { RouterHistory } from 'vue-router'
import { createApp } from 'vue'
import { createRouter } from '../router'
import { createContext } from '@cexoso/vue-singleton'
import './style.css'

export interface RenderContainerOptions {
  container: Element | string
  history: RouterHistory
  component: Component
  play?: () => any
}

export async function renderContainer(opts: RenderContainerOptions) {
  const container = opts.container
  const app = createApp(opts.component)

  const router = createRouter({
    history: opts.history,
  })

  app.use(router).use(createContext())
  const init = app.runWithContext(() => Promise.resolve(opts.play?.()))

  return init
    .then(() => router.isReady())
    .then(() => {
      app.mount(container)
      return app
    })
}
