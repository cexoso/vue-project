import { describe, expect, it } from 'vitest'
import { Buffer } from 'buffer'
import { encode, decode } from './index'

export const Uint8ArrayToHexString = (uint8Array: Uint8Array) => Buffer.from(uint8Array).toString('hex')

describe('coding', () => {
  it('decode', () => {
    const bytes = [0x00, 0x00, 0x00, 0x00, 0x07, 0x0a, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64]

    const messageOnHttp2 = new Uint8Array(Buffer.from(bytes))
    const result = decode(messageOnHttp2)
    expect(Uint8ArrayToHexString(result)).eq('0a05776f726c64')
  })
  it('encode', () => {
    const bytes = [0x0a, 0x05, 0x77, 0x6f, 0x72, 0x6c, 0x64]
    const message = Buffer.from(bytes)
    const result = encode(message)
    expect(Uint8ArrayToHexString(result)).eq('00000000070a05776f726c64')
  })
})
