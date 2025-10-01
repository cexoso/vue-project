import Koa from 'koa'
import detectPort from 'detect-port'
import { parentPort } from 'worker_threads'
import { Method } from '../router'
import Router from 'koa-router'
import { run } from '../als'
import body from 'koa-body'
import { LifeCycleManager } from './life-cycle-manager'

export class App<T extends { [key: string]: Method }> {
  private app = new Koa({
    asyncLocalStorage: true,
  })
  private lifeCycleManager = new LifeCycleManager()
  private registeFunction() {
    const entries = Object.entries(this.opts.router)

    const router = new Router()
    for (const [key, value] of entries) {
      router.post('/' + key, body(), ...value.middlewares, async (ctx) => {
        async function callAndReturn(input?: any) {
          const data = await value.method(input)
          ctx.status = 200

          ctx.body = { code: 0, message: '', data: data }
        }
        if (!value.args) {
          return await callAndReturn()
        }
        const result = value.args.safeParse(ctx.request.body?.payload)
        if (result.success) {
          await callAndReturn(result.data)
        } else {
          ctx.status = 400
          ctx.body = result.error.message
        }
      })
    }

    this.app.use(router.routes())
  }
  private useALS() {
    this.app.use(async (ctx, next) => {
      // 确保所有的中间件都跑在 ALS 下
      await run(ctx, async () => {
        await next()
      })
    })
  }
  public constructor(private opts: { router: T }) {
    this.app.keys = ['functional-framework']
    this.useALS()
    this.app.use(this.lifeCycleManager.beforeRequestMiddleware) // 生命周期的 hooks
    this.registeFunction()
  }
  public async listen(port?: number) {
    return detectPort(port || process.env['preferPort']).then((port) => {
      const result = this.app.listen(port)
      parentPort?.postMessage({
        type: 'listening',
        payload: { port },
      })
      return result
    })
  }

  /* start 以下的函数为提高可测试性，不应在生产使用 */
  public beforeRequest = this.lifeCycleManager.beforeRequest
  public reset = this.lifeCycleManager.reset
  /* end */
}
