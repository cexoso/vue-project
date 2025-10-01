import { App, createMethod, createRouter } from '@cexoso/ff-server'

const router = createRouter({
  uploadFile: createMethod({
    middlewares: [],
    implement: () => {
      return 'hello'
    },
  }),
})

export const app = new App({ router })
