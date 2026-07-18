import { beforeEach, describe, expect, it } from 'vitest'
import { getBackgroundStateSnapshot, restoreBackgroundState } from '../../_shared/background-state'
import { registerBackgroundState, state } from '../../g2/state'

describe('g2/state background persistence', () => {
  beforeEach(() => {
    state.displaySeconds = true
    state.position = 'center'
    state.startupRendered = false
    state.lastRenderedPosition = 'center'
  })

  it('captures and restores runtime clock state', () => {
    registerBackgroundState()

    state.displaySeconds = false
    state.position = 'bottomright'
    state.startupRendered = true
    state.lastRenderedPosition = 'bottomright'

    const snapshotRaw = getBackgroundStateSnapshot()
    expect(snapshotRaw).toBeTruthy()

    const snapshot = JSON.parse(snapshotRaw) as {
      clockState?: Record<string, unknown>
    }

    expect(snapshot.clockState?.displaySeconds).toBe(false)
    expect(snapshot.clockState?.position).toBe('bottomright')
    expect(snapshot.clockState?.startupRendered).toBe(true)
    expect(snapshot.clockState?.lastRenderedPosition).toBe('bottomright')

    state.displaySeconds = true
    state.position = 'center'
    state.startupRendered = false
    state.lastRenderedPosition = 'center'

    restoreBackgroundState(snapshotRaw)

    expect(state.displaySeconds).toBe(false)
    expect(state.position).toBe('bottomright')
    expect(state.startupRendered).toBe(true)
    expect(state.lastRenderedPosition).toBe('bottomright')
  })
})
