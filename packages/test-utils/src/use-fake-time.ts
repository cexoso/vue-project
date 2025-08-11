import { afterEach, beforeEach, vi } from 'vitest'

export const useFakeTime = (...config: Parameters<typeof vi.useFakeTimers>) => {
  beforeEach(() => {
    vi.useFakeTimers(...config)
  })
  afterEach(() => {
    vi.useRealTimers()
  })
}
