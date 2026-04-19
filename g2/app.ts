import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { appendEventLog } from '../_shared/log'
import { setBridge } from './state'
import { showTime } from './renderer'

export async function initApp(appBridge: EvenAppBridge): Promise<void> {
  setBridge(appBridge)

  appendEventLog('Clock: initialised')
  await showTime()

  // Update time every second
  setInterval(() => {
    void updateTime()
  }, 1000)
}

export async function updateTime(): Promise<void> {
  await showTime()
}