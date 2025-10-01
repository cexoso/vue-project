import { describe, it, beforeAll, afterAll } from 'vitest'
import { Server } from 'http'
import { launch } from './index'
import supertest from 'supertest'

describe('index', () => {
  let server: Server
  beforeAll(async () => {
    server = launch()
  })
  afterAll(() => {
    server?.close()
  })
  it('i', async () => {
    return supertest(server).get('/').expect(200)
  })
})
