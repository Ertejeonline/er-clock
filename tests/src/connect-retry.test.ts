import { describe, expect, it } from 'vitest'
import { formatReconnectStatus, getReconnectDelayMs, RECONNECT_DELAYS_MS } from '../../src/connect-retry'

describe('connect-retry', () => {
  it('returns bounded reconnect delays by attempt number', () => {
    expect(getReconnectDelayMs(0)).toBe(RECONNECT_DELAYS_MS[0])
    expect(getReconnectDelayMs(1)).toBe(RECONNECT_DELAYS_MS[0])
    expect(getReconnectDelayMs(2)).toBe(RECONNECT_DELAYS_MS[1])
    expect(getReconnectDelayMs(3)).toBe(RECONNECT_DELAYS_MS[2])
    expect(getReconnectDelayMs(99)).toBe(RECONNECT_DELAYS_MS[RECONNECT_DELAYS_MS.length - 1])
  })

  it('formats reconnect status with seconds and attempt number', () => {
    expect(formatReconnectStatus(1500, 1)).toBe('Reconnect in 2s (attempt 1)')
    expect(formatReconnectStatus(8000, 4)).toBe('Reconnect in 8s (attempt 4)')
  })
})
