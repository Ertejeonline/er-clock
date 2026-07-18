import * as sdk from '@evenrealities/even_hub_sdk'

type StateExporter = () => Record<string, unknown>
type StateRestorer = (saved: Record<string, unknown>) => void

declare global {
  interface Window {
    __getStateSnapshot?: () => string
    __restoreState?: (snapshot: string | Record<string, unknown>) => void
  }
}

const exporters = new Map<string, StateExporter>()
const restorers = new Map<string, StateRestorer>()

export function getBackgroundStateSnapshot(): string {
  const result: Record<string, unknown> = {}
  for (const [key, exporter] of exporters.entries()) {
    try {
      result[key] = exporter()
    } catch (err) {
      console.warn(`[clock] failed to export state for ${key}`, err)
    }
  }
  return JSON.stringify(result)
}

export function restoreBackgroundState(snapshot: string | Record<string, unknown>): void {
  let parsed: Record<string, unknown> = {}

  if (typeof snapshot === 'string') {
    try {
      parsed = JSON.parse(snapshot) as Record<string, unknown>
    } catch (err) {
      console.warn('[clock] failed to parse background state snapshot', err)
      return
    }
  } else if (snapshot && typeof snapshot === 'object') {
    parsed = snapshot
  }

  for (const [key, restorer] of restorers.entries()) {
    const value = parsed[key]
    if (value && typeof value === 'object') {
      try {
        restorer(value as Record<string, unknown>)
      } catch (err) {
        console.warn(`[clock] failed to restore state for ${key}`, err)
      }
    }
  }
}

function initGlobalHandlers(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!window.__getStateSnapshot) {
    window.__getStateSnapshot = getBackgroundStateSnapshot
  }

  if (!window.__restoreState) {
    window.__restoreState = restoreBackgroundState
  }
}

const sdkAny = sdk as unknown as Record<string, unknown>
const SET_BACKGROUND_STATE_KEY = 'setBackgroundState'
const ON_BACKGROUND_RESTORE_KEY = 'onBackgroundRestore'

export function setBackgroundState(key: string, exporter: StateExporter): void {
  const nativeSetBackgroundState = sdkAny[SET_BACKGROUND_STATE_KEY]
  if (typeof nativeSetBackgroundState === 'function') {
    (nativeSetBackgroundState as (key: string, exporter: StateExporter) => void)(key, exporter)
    return
  }

  exporters.set(key, exporter)
  initGlobalHandlers()
}

export function onBackgroundRestore(key: string, restorer: StateRestorer): void {
  const nativeOnBackgroundRestore = sdkAny[ON_BACKGROUND_RESTORE_KEY]
  if (typeof nativeOnBackgroundRestore === 'function') {
    (nativeOnBackgroundRestore as (key: string, restorer: StateRestorer) => void)(key, restorer)
    return
  }

  restorers.set(key, restorer)
  initGlobalHandlers()
}
