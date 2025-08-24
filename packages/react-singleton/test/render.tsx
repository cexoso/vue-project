import { within } from '@testing-library/dom'
import { createRoot } from 'react-dom/client'
import { ReactNode } from 'react'
import { Provider } from '../src/context'
import { screen } from '@testing-library/dom'

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

interface Handler {
  unmount: () => void
}
const wm = new WeakMap<HTMLDivElement, Handler>()

export const renderComponent = (Component: () => ReactNode) => {
  const container = createContainer()
  const root = createRoot(container)
  root.render(
    <Provider>
      <Component />
    </Provider>
  )

  wm.set(container, {
    unmount() {
      root.unmount()
    },
  })

  return {
    debug() {
      screen.debug(container)
    },
    ...within(container),
    play<T>(_cb: () => T) {
      // return app.runWithContext(cb)
    },
  }
}
