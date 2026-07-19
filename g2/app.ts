import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, registerBackgroundState, setBridge } from './state'
import { showTime, loadSettings } from './renderer'

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)
  registerBackgroundState()

  appendEventLog('Clock: initialised')
  await loadSettings()
  await showTime()
  scheduleNextTick()
}

async function tick(): Promise<void> {
  if (state.appInForeground) {
    await safeUpdateTime()
  }
  scheduleNextTick()
}

async function safeUpdateTime(): Promise<void> {
  try {
    await updateTime()
  } catch (err) {
    console.warn('[clock] update tick failed', err)
    appendEventLog('Clock: update tick failed (recovered)')
  }
}

export function rescheduleUpdateTimer(): void {
  scheduleNextTick()
}

export function stopUpdateTimer(): void {
  if (state.updateTimerId !== null) {
    window.clearTimeout(state.updateTimerId)
    state.updateTimerId = null
  }
}

function scheduleNextTick(): void {
  stopUpdateTimer()

  state.updateTimerId = window.setTimeout(() => {
    void tick()
  }, 1000)
}

export async function updateTime(): Promise<void> {
  await showTime()
}