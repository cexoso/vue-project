import { Middleware, Context } from 'koa'

type ContextMocker = (ctx: Context) => unknown
export class LifeCycleManager {
  private mockContextAtBeforeRequest: ContextMocker | undefined

  public beforeRequest = (mockContext: ContextMocker) => {
    this.mockContextAtBeforeRequest = mockContext
  }

  public beforeRequestMiddleware: Middleware = async (ctx, next) => {
    const { mockContextAtBeforeRequest } = this
    if (mockContextAtBeforeRequest) {
      await mockContextAtBeforeRequest(ctx)
    }
    await next()
  }

  public reset = () => {
    this.mockContextAtBeforeRequest = undefined
  }
}
