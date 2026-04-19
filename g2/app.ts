import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, setBridge } from './state'
import { showTime } from './renderer'

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)

  appendEventLog('Clock: initialised')
  await showTime()
  scheduleNextTick()
}

async function tick(): Promise<void> {
  await updateTime()
  scheduleNextTick()
}

export function rescheduleUpdateTimer(): void {
  scheduleNextTick()
}

function scheduleNextTick(): void {
  if (state.updateTimerId !== null) {
    window.clearTimeout(state.updateTimerId)
  }

  // If displaying seconds, update every second; otherwise, align the next tick to the start of the next minute
  const delay = state.displaySeconds
    ? 1000
    : 60000 - (Date.now() % 60000) // aligns next tick to the start of the next minute

  state.updateTimerId = window.setTimeout(() => {
    void tick()
  }, delay)
}

export async function updateTime(): Promise<void> {
  await showTime()
}