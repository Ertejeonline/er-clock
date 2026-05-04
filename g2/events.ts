import { OsEventTypeList, type EvenHubEvent } from '@evenrealities/even_hub_sdk'
import { getBridge } from './state'
import { appendEventLog } from '../_shared/log'

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
  }
}