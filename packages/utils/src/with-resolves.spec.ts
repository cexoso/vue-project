import { describe, expect, it } from 'vitest'
import { withResolvers } from './with-resolves'
import { stub } from 'sinon'
import { delay } from '@cexoso/test-utils'
describe('with-resolves', () => {
  it('resolve', async () => {
    const { promise, resolve } = withResolvers()
    const resolveStub = stub()
    const rejectStub = stub()
    promise.then(resolveStub, rejectStub)
    resolve(1)
    await delay(0)
    expect(resolveStub.called).eq(true)
  })
  it('reject', async () => {
    const { promise, reject } = withResolvers()
    const resolveStub = stub()
    const rejectStub = stub()
    promise.then(resolveStub, rejectStub)
    reject(1)
    await delay(0)
    expect(rejectStub.called).eq(true)
  })
})
