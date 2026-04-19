import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

export type PositionType = 'topleft' | 'topright' | 'center' | 'bottomleft' | 'bottomright'

export const state = {
  startupRendered: false,
  displaySeconds: true,
  position: 'center' as PositionType,
  lastRenderedPosition: 'center' as PositionType,
  updateTimerId: null as number | null,
}

let _bridge: EvenAppBridge | null = null

export function getBridge(): EvenAppBridge | null {
  return _bridge
}

export function setBridge(b: EvenAppBridge): void {
  _bridge = b
}