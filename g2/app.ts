import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { state, setBridge } from './state'
import { showTime } from './renderer'
import { handleEvent } from './events'

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)

  appBridge.onEvenHubEvent(handleEvent)

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

  state.updateTimerId = window.setTimeout(() => {
    void tick()
  }, 1000)
}

export async function updateTime(): Promise<void> {
  await showTime()
}