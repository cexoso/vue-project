import { within } from '@testing-library/dom'
import { createRoot } from 'react-dom/client'
import { ReactNode, useEffect, useState } from 'react'
import { Provider } from '../src/context'
import { screen } from '@testing-library/dom'
import { Subject } from 'rxjs'

let div: HTMLDivElement | undefined
const createContainer = () => {
  if (div !== undefined) {
    clean()
  }
  div = document.createElement('div')
  return div
}

function TaskRunner<T>(props: { taskSetup: () => () => T; onTaskDone: (value: T) => void }): ReactNode {
  const task = props.taskSetup()
  useEffect(() => {
    Promise.resolve(task()).then((value) => props.onTaskDone(value))
  })
  return null
}
type Taskdescription<T = any> = { taskSetup: () => () => T; onTaskDone: (value: T) => void }

function Container(props: { children: ReactNode; taskSubject: Subject<Taskdescription> }) {
  const [list, setList] = useState<Taskdescription<unknown>[]>([])
  useEffect(() => {
    const handler = props.taskSubject.subscribe((task) => setList((list) => [...list, task]))
    return () => handler.unsubscribe()
  }, [props.taskSubject])

  return (
    <>
      {list.map((task, key) => (
        <TaskRunner
          key={key}
          taskSetup={task.taskSetup}
          onTaskDone={(value) => {
            task.onTaskDone(value)
            setList(list.filter((t) => task !== t))
          }}
        />
      ))}
      {props.children}
    </>
  )
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
  const subject = new Subject<Taskdescription>()

  root.render(
    <Provider>
      <Container taskSubject={subject}>
        <Component />
      </Container>
    </Provider>
  )

  function play<T>(cb: () => () => T) {
    return new Promise((resolve) => subject.next({ taskSetup: cb, onTaskDone: resolve }))
  }

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
    play,
  }
}
