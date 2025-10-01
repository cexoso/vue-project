import { Middleware } from 'koa'
import { ZodType } from 'zod'
export type Method<T = any, R = any> = {
  args: ZodType<T> | undefined
  method: (args: T) => R
  middlewares: Middleware[]
}

export const createMethod = <T, R>(opts: {
  middlewares?: Middleware[]
  inputZod?: ZodType<T>
  implement: (args: T) => R
}) => {
  return {
    method: opts.implement,
    args: opts.inputZod,
    middlewares: Array.isArray(opts.middlewares) ? opts.middlewares : [],
  }
}

export const createRouter = <T extends { [key: string]: Method<any, any> }>(defineds: T) => {
  return defineds
}
