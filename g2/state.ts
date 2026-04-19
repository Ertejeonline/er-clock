import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'

export const state = {
  startupRendered: false,
}

let _bridge: EvenAppBridge | null = null

export function getBridge(): EvenAppBridge | null {
  return _bridge
}

export function setBridge(b: EvenAppBridge): void {
  _bridge = b
}