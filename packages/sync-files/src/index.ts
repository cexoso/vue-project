import Koa from 'koa'
import koaBody from 'koa-body'
import { isAbsolute, join } from 'path'
import { cwd } from 'process'
import { renameSync } from 'fs'
import { makeSureDirExist } from '@cexoso/utils'
import serve from 'koa-static'

function createApp(o: { fileDir: string }) {
  const fileDir = o.fileDir
  const app = new Koa()
  app.use(serve(join(__dirname, '../dist')))
  app.use(
    koaBody({
      multipart: true,
    })
  )
  app.use((ctx, _next) => {
    const files = ctx.request.files
    const toList = <T>(item: T | T[]) => {
      if (Array.isArray(item)) {
        return item
      }
      return [item]
    }
    if (files) {
      const names = Object.keys(files)
      for (const name of names) {
        toList(files[name]).map((file) => {
          const originalFilename = file.originalFilename ?? Date.now().toString()
          const filepath = join(fileDir, originalFilename)
          makeSureDirExist(filepath)
          renameSync(file.filepath, filepath)
        })
      }
    }
    ctx.status = 200
    ctx.body = 'ok'
  })
  return app
}

export function launch() {
  const toAbsolute = (path: string) => (isAbsolute(path) ? path : join(cwd(), path))
  const fileDir = toAbsolute(process.env.FILE_DIR ?? __dirname)
  const app = createApp({ fileDir })
  const server = app.listen(process.env.PORT ?? 9394)
  return server
}
