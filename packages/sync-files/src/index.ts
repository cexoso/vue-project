import Koa from 'koa'

function createApp() {
  const app = new Koa()
  app.use((ctx, next) => {
    ctx.body = 'hello'
  })
  return app
}

export function launch() {
  const app = createApp()
  const server = app.listen(process.env.PORT ?? 9394)
  return server
}
