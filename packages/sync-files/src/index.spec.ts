import { describe, it, beforeAll, afterAll } from 'vitest'
import { Server } from 'http'
import { launch } from './index'
import supertest from 'supertest'
import { createReadStream } from 'fs'
import { join } from 'path'
const indexReadStream = createReadStream('./index.ts')

describe('index', () => {
  let server: Server
  beforeAll(async () => {
    process.env.FILE_DIR = join(__dirname, '../../temp-file')
    server = launch()
  })
  afterAll(() => {
    server?.close()
    process.env.FILE_DIR = undefined
  })
  it('文件上传', async () => {
    return supertest(server)
      .post('/upload')
      .attach('file.tar', indexReadStream, {
        contentType: 'text/plain',
      })
      .expect(200)
  })
})
