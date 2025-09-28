import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { Buffer } from 'buffer'
import { base64ToUint8Array, uint8ArrayToBase64 } from './index'

export const Uint8ArrayToHexString = (uint8Array: Uint8Array) => Buffer.from(uint8Array).toString('hex')

describe('base64 uint8Array', () => {
  describe('老旧浏览器', () => {
    let TextEncoder = global.TextEncoder
    let TextDecoder = global.TextDecoder
    beforeEach(() => {
      // @ts-ignore
      global.TextEncoder = undefined
      // @ts-ignore
      global.TextDecoder = undefined
    })
    afterEach(() => {
      global.TextEncoder = TextEncoder
      global.TextDecoder = TextDecoder
    })
    it('base64 to uint8Array', () => {
      const base64Data = btoa('Hello World')
      const uint8Array = base64ToUint8Array(base64Data)
      const x = uint8ArrayToBase64(uint8Array)
      expect(x).eq(btoa('Hello World'))
    })
  })
  it('base64 to uint8Array', () => {
    const base64Data = btoa('Hello World')
    const uint8Array = base64ToUint8Array(base64Data)
    const x = uint8ArrayToBase64(uint8Array)
    expect(x).eq(btoa('Hello World'))
  })
})
