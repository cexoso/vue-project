import { describe, expect, it } from 'vitest'
import { getOrCreateStub } from './get-or-create-stub'

describe('get-or-create-stub.ts', () => {
  it('对同一个对象进行 stub 返回的实例是相同的', async () => {
    const a = {
      get() {
        return 1
      },
    }
    expect(getOrCreateStub(a, 'get')).eq(getOrCreateStub(a, 'get'))
  })
  it('getOrCreateStub 背后仍是 stub，可以改变对象的行为', async () => {
    const a = {
      get() {
        return 1
      },
    }
    getOrCreateStub(a, 'get').returns(2)
    expect(a.get()).eq(2)
  })
})
