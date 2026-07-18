import { DeviceConnectType, OsEventTypeList, type EvenHubEvent, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import type { AppActions, SetStatus } from '../_shared/app-types'
import { appendEventLog } from '../_shared/log'
import { initApp, stopUpdateTimer, updateTime } from './app'
import { handleEvent } from './events'
import { resetRendererSession, setRenderFailureHandler } from './renderer'
import { clearBridge } from './state'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timer))
  })
}

export function createClockActions(setStatus: SetStatus): AppActions {
  let connected = false
  let connecting = false
  let appInForeground = true
  let teardownRegistered = false
  let unsubscribeEvenHubEvent: (() => void) | null = null
  let unsubscribeDeviceStatus: (() => void) | null = null
  let reconnectTimerId: number | null = null

  const resolveEventType = (event: EvenHubEvent): number | undefined => {
    return event.sysEvent?.eventType ?? event.textEvent?.eventType ?? event.listEvent?.eventType
  }

  const clearReconnectTimer = () => {
    if (reconnectTimerId !== null) {
      window.clearTimeout(reconnectTimerId)
      reconnectTimerId = null
    }
  }

  const scheduleReconnect = (delayMs: number) => {
    clearReconnectTimer()
    reconnectTimerId = window.setTimeout(() => {
      reconnectTimerId = null
      if (connected || connecting || !appInForeground) {
        return
      }
      appendEventLog('Lifecycle: attempting automatic reconnect')
      void attemptConnect()
    }, delayMs)
  }

  const cleanupBridgeListeners = () => {
    unsubscribeEvenHubEvent?.()
    unsubscribeEvenHubEvent = null
    unsubscribeDeviceStatus?.()
    unsubscribeDeviceStatus = null
    setRenderFailureHandler(null)
  }

  const cleanupConnection = () => {
    cleanupBridgeListeners()
    stopUpdateTimer()
    resetRendererSession()
    clearBridge()
    connected = false
  }

  const registerTeardown = () => {
    if (teardownRegistered) {
      return
    }
    teardownRegistered = true

    window.addEventListener('beforeunload', () => {
      appInForeground = false
      clearReconnectTimer()
      cleanupConnection()
    })

    window.addEventListener('pagehide', () => {
      appInForeground = false
      clearReconnectTimer()
      stopUpdateTimer()
    })

    window.addEventListener('pageshow', () => {
      appInForeground = true
      if (!connected && !connecting) {
        scheduleReconnect(250)
      }
    })

    document.addEventListener('visibilitychange', () => {
      appInForeground = !document.hidden
      if (!appInForeground) {
        stopUpdateTimer()
        return
      }

      if (!connected && !connecting) {
        scheduleReconnect(250)
      }
    })
  }

  const attemptConnect = async (): Promise<void> => {
    if (connecting) {
      setStatus('Connection already in progress...')
      return
    }

    if (connected) {
      setStatus('Already connected')
      return
    }

    connecting = true
    clearReconnectTimer()
    setStatus('Connecting to Even bridge...')
    appendEventLog(`ER Clock v${typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}`)

    try {
      const bridge = await withTimeout(waitForEvenAppBridge(), 6000)
      cleanupBridgeListeners()
      registerTeardown()

      unsubscribeEvenHubEvent = bridge.onEvenHubEvent((event) => {
        try {
          handleEvent(event)

          const eventType = resolveEventType(event)
          if (
            eventType === OsEventTypeList.ABNORMAL_EXIT_EVENT ||
            eventType === OsEventTypeList.SYSTEM_EXIT_EVENT
          ) {
            appendEventLog('Lifecycle: exit event detected')
            cleanupConnection()
            setStatus('Disconnected. Reconnecting...')
            scheduleReconnect(3000)
          }
        } catch (err) {
          console.error('[clock] event handler failed', err)
          appendEventLog('Lifecycle: event handler error (recovered)')
        }
      })

      unsubscribeDeviceStatus = bridge.onDeviceStatusChanged((status) => {
        try {
          if (
            connected && (
              status.connectType === DeviceConnectType.Disconnected ||
              status.connectType === DeviceConnectType.ConnectionFailed
            )
          ) {
            appendEventLog(`Lifecycle: device disconnected (${DeviceConnectType[status.connectType]})`)
            cleanupConnection()
            setStatus('Disconnected. Reconnecting...')
            scheduleReconnect(3000)
          }
        } catch (err) {
          console.warn('[clock] device status handler failed', err)
        }
      })

      try {
        await initApp(bridge)
      } catch (err) {
        console.error('[clock] initApp failed', err)
        cleanupConnection()
        setStatus('Initialization failed. Retrying...')
        appendEventLog('Lifecycle: initApp failed (recovered)')
        scheduleReconnect(3000)
        return
      }

      setRenderFailureHandler((_err) => {
        if (!connected) {
          return
        }
        appendEventLog('Lifecycle: repeated render failures detected')
        cleanupConnection()
        setStatus('Display update failed. Reconnecting...')
        scheduleReconnect(3000)
      })

      connected = true
      setStatus('Connected. Displaying current time.')
      appendEventLog('Bridge connected')
    } catch (err) {
      console.error('[clock] connect failed', err)
      setStatus('Bridge not found. Running in mock mode.')
      appendEventLog('Connection failed')
      if (appInForeground) {
        scheduleReconnect(5000)
      }
    } finally {
      connecting = false
    }
  }

  return {
    async connect() {
      await attemptConnect()
    },
    async action() {
      if (!connected) {
        setStatus('Not connected')
        return
      }

      try {
        await updateTime()
        setStatus('Time updated')
      } catch (err) {
        console.error('[clock] manual update failed', err)
        appendEventLog('Clock: manual update failed')
        cleanupConnection()
        setStatus('Update failed. Reconnecting...')
        scheduleReconnect(1500)
      }
    },
  }
}