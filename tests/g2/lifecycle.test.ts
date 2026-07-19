import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// app.ts/state.ts rely on `window.setTimeout`/`window.clearTimeout`; the test
// environment runs in plain Node (no DOM), so stub a minimal `window`.
beforeAll(() => {
  if (typeof (globalThis as { window?: unknown }).window === 'undefined') {
    ;(globalThis as { window: unknown }).window = globalThis
  }
})

vi.mock('../../_shared/log', () => ({
  appendEventLog: vi.fn(),
}))

vi.mock('@evenrealities/even_hub_sdk', () => {
  class BaseContainer {
    constructor(config: Record<string, unknown>) {
      Object.assign(this, config)
    }
  }

  return {
    CreateStartUpPageContainer: BaseContainer,
    RebuildPageContainer: BaseContainer,
    TextContainerProperty: BaseContainer,
    TextContainerUpgrade: BaseContainer,
    OsEventTypeList: {
      CLICK_EVENT: 0,
      DOUBLE_CLICK_EVENT: 1,
      FOREGROUND_ENTER_EVENT: 4,
      FOREGROUND_EXIT_EVENT: 5,
      ABNORMAL_EXIT_EVENT: 6,
      SYSTEM_EXIT_EVENT: 7,
    },
  }
})

import { OsEventTypeList } from '@evenrealities/even_hub_sdk'
import { handleEvent } from '../../g2/events'
import { rescheduleUpdateTimer, stopUpdateTimer } from '../../g2/app'
import { resetRendererSession } from '../../g2/renderer'
import { setBridge, state } from '../../g2/state'

function makeBridgeMocks() {
  return {
    getLocalStorage: vi.fn(async () => ''),
    setLocalStorage: vi.fn(async () => true),
    createStartUpPageContainer: vi.fn(async () => 0),
    rebuildPageContainer: vi.fn(async () => true),
    textContainerUpgrade: vi.fn(async () => true),
    shutDownPageContainer: vi.fn(async () => undefined),
  }
}

describe('g2 lifecycle: foreground/background handling', () => {
  beforeEach(() => {
    resetRendererSession()
    state.appInForeground = true
    state.startupRendered = false
    state.position = 'center'
    state.lastRenderedPosition = 'center'
    state.updateTimerId = null
  })

  afterEach(() => {
    stopUpdateTimer()
    vi.useRealTimers()
  })

  it('stops the update timer and marks the app backgrounded on FOREGROUND_EXIT_EVENT', () => {
    const bridge = makeBridgeMocks()
    setBridge(bridge as never)

    rescheduleUpdateTimer()
    expect(state.updateTimerId).not.toBeNull()

    handleEvent({ sysEvent: { eventType: OsEventTypeList.FOREGROUND_EXIT_EVENT } } as never)

    expect(state.appInForeground).toBe(false)
    expect(state.updateTimerId).toBeNull()
  })

  it('resumes the timer and immediately refreshes the display on FOREGROUND_ENTER_EVENT', async () => {
    const bridge = makeBridgeMocks()
    setBridge(bridge as never)
    state.appInForeground = false
    state.updateTimerId = null

    handleEvent({ sysEvent: { eventType: OsEventTypeList.FOREGROUND_ENTER_EVENT } } as never)

    expect(state.appInForeground).toBe(true)
    expect(state.updateTimerId).not.toBeNull()

    // Allow the fire-and-forget immediate refresh to complete.
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(bridge.createStartUpPageContainer).toHaveBeenCalledTimes(1)
  })

  it('is a no-op when already in the reported foreground/background state', () => {
    const bridge = makeBridgeMocks()
    setBridge(bridge as never)

    state.appInForeground = false
    state.updateTimerId = null
    handleEvent({ sysEvent: { eventType: OsEventTypeList.FOREGROUND_EXIT_EVENT } } as never)
    expect(state.updateTimerId).toBeNull()

    state.appInForeground = true
    rescheduleUpdateTimer()
    const timerId = state.updateTimerId
    handleEvent({ sysEvent: { eventType: OsEventTypeList.FOREGROUND_ENTER_EVENT } } as never)
    // Timer id should be unchanged since the app was already foregrounded.
    expect(state.updateTimerId).toBe(timerId)
  })

  it('skips display updates while backgrounded but resumes once foreground returns', async () => {
    vi.useFakeTimers()
    const bridge = makeBridgeMocks()
    setBridge(bridge as never)
    state.appInForeground = false

    rescheduleUpdateTimer()
    await vi.advanceTimersByTimeAsync(1000)

    expect(bridge.createStartUpPageContainer).not.toHaveBeenCalled()
    expect(bridge.textContainerUpgrade).not.toHaveBeenCalled()

    state.appInForeground = true
    await vi.advanceTimersByTimeAsync(1000)

    const renderCallCount = bridge.createStartUpPageContainer.mock.calls.length
      + bridge.textContainerUpgrade.mock.calls.length
    expect(renderCallCount).toBeGreaterThan(0)
  })
})
