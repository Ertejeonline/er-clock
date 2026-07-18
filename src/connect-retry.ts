export const RECONNECT_DELAYS_MS = [1500, 3000, 5000, 8000] as const

export function getReconnectDelayMs(attempt: number): number {
  if (attempt <= 0) {
    return RECONNECT_DELAYS_MS[0]
  }
  const index = Math.min(attempt - 1, RECONNECT_DELAYS_MS.length - 1)
  return RECONNECT_DELAYS_MS[index]
}

export function formatReconnectStatus(delayMs: number, attempt: number): string {
  const seconds = Math.max(1, Math.ceil(delayMs / 1000))
  return `Reconnect in ${seconds}s (attempt ${attempt})`
}
