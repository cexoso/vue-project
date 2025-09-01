import { describe, it, expect } from 'vitest'
import { loadConfig } from './loadConfig'
import { join } from 'path'

describe('load data', () => {
  it('x', async () => {
    const file = join(__dirname, '../test/mock-config.ts')
    expect(
      await loadConfig(file, {
        debug: true,
      })
    ).deep.eq({ q: 1 })
  })
})
