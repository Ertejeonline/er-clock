import { OsEventTypeList, type EvenHubEvent } from '@evenrealities/even_hub_sdk'
import { getBridge, state } from './state'
import { appendEventLog } from '../_shared/log'
import { rescheduleUpdateTimer, stopUpdateTimer, updateTime } from './app'

function resolveEventType(event: EvenHubEvent): number | undefined {
  return (
    event.sysEvent?.eventType ??
    event.textEvent?.eventType ??
    event.listEvent?.eventType
  )
}

export function handleEvent(event: EvenHubEvent): void {
  const type = resolveEventType(event)

  if (type === OsEventTypeList.DOUBLE_CLICK_EVENT) {
    appendEventLog('Double-tap: exiting')
    void getBridge()?.shutDownPageContainer(1)
    return
  }

  // Firmware sometimes misses browser visibilitychange transitions; the SDK's
  // own lifecycle events are the authoritative signal for background/foreground.
  if (type === OsEventTypeList.FOREGROUND_ENTER_EVENT) {
    if (!state.appInForeground) {
      state.appInForeground = true
      appendEventLog('Lifecycle: foreground enter')
      rescheduleUpdateTimer()
      void updateTime()
    }
    return
  }

  if (type === OsEventTypeList.FOREGROUND_EXIT_EVENT) {
    if (state.appInForeground) {
      state.appInForeground = false
      appendEventLog('Lifecycle: foreground exit')
      stopUpdateTimer()
    }
    return
  }
}