import { describe, it, beforeAll, afterAll } from 'vitest'
import { Server } from 'http'
import { app } from './index'
import supertest from 'supertest'

describe('index', () => {
  let server: Server
  beforeAll(async () => {
    server = await app.listen()
  })
  afterAll(() => {
    server?.close()
    app.reset()
  })
  it('i', async () => {
    return supertest(server).post('/uploadFile').expect(200)
  })
})
