import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { onBackgroundRestore, setBackgroundState } from '../_shared/background-state'

export type PositionType = 'topleft' | 'topright' | 'center' | 'bottomleft' | 'bottomright'

export const state = {
  startupRendered: false,
  displaySeconds: true,
  position: 'center' as PositionType,
  lastRenderedPosition: 'center' as PositionType,
  updateTimerId: null as number | null,
  appInForeground: true,
}

let _bridge: EvenAppBridge | null = null

type PersistedClockState = {
  displaySeconds: boolean
  position: PositionType
}

export function getBridge(): EvenAppBridge | null {
  return _bridge
}

export function setBridge(b: EvenAppBridge): void {
  _bridge = b
}

export function clearBridge(): void {
  _bridge = null
}

export function toPersistedState(): PersistedClockState {
  return {
    displaySeconds: state.displaySeconds,
    position: state.position,
  }
}

export function applyHydratedState(raw: string): void {
  let parsed: Partial<PersistedClockState> | null = null
  try {
    parsed = JSON.parse(raw) as Partial<PersistedClockState>
  } catch {
    return
  }

  if (typeof parsed.displaySeconds === 'boolean') {
    state.displaySeconds = parsed.displaySeconds
  }

  if (
    parsed.position === 'topleft' ||
    parsed.position === 'topright' ||
    parsed.position === 'center' ||
    parsed.position === 'bottomleft' ||
    parsed.position === 'bottomright'
  ) {
    state.position = parsed.position
  }
}

export function registerBackgroundState(): void {
  setBackgroundState('clockState', () => ({
    ...toPersistedState(),
    startupRendered: state.startupRendered,
    lastRenderedPosition: state.lastRenderedPosition,
  }))

  onBackgroundRestore('clockState', (saved) => {
    const hydrated = saved as Partial<PersistedClockState> & {
      startupRendered?: boolean
      lastRenderedPosition?: PositionType
    }

    applyHydratedState(JSON.stringify(hydrated))

    if (typeof hydrated.startupRendered === 'boolean') {
      state.startupRendered = hydrated.startupRendered
    }

    if (
      hydrated.lastRenderedPosition === 'topleft' ||
      hydrated.lastRenderedPosition === 'topright' ||
      hydrated.lastRenderedPosition === 'center' ||
      hydrated.lastRenderedPosition === 'bottomleft' ||
      hydrated.lastRenderedPosition === 'bottomright'
    ) {
      state.lastRenderedPosition = hydrated.lastRenderedPosition
    }
  })
}