import type { AppModule } from '../_shared/app-types'
import { setDisplaySecondsPreference, setPositionPreference, showTime } from '../g2/renderer'
import { rescheduleUpdateTimer } from '../g2/app'
import { getBridge, state, type PositionType } from '../g2/state'
import { formatReconnectStatus, getReconnectDelayMs } from './connect-retry'
import {
  initializeUiControlsFromCache,
  saveDisplaySecondsUiSetting,
  savePositionUiSetting,
  syncUiControlsToPreferences,
  type UiSettingsControls,
} from './settings-ui'

function updateStatus(text: string) {
  console.log(`[ui] ${text}`)
  const el = document.getElementById('status')
  if (el) el.textContent = text
}

function createDebouncedStatusUpdater(delayMs = 120): (text: string) => void {
  let timerId: number | null = null

  return (text: string) => {
    if (timerId !== null) {
      window.clearTimeout(timerId)
    }
    timerId = window.setTimeout(() => {
      timerId = null
      updateStatus(text)
    }, delayMs)
  }
}

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default
  const updateStatusDebounced = createDebouncedStatusUpdater()

  const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null
  const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement | null
  const displaySecondsCheckbox = document.getElementById('displaySeconds') as HTMLInputElement | null
  const positionSelect = document.getElementById('positionSelect') as HTMLSelectElement | null
  const controls: UiSettingsControls = { displaySecondsCheckbox, positionSelect }

  document.title = `${app.name} – Even G2`
  updateStatus(app.initialStatus ?? `${app.name} app ready`)

  initializeUiControlsFromCache(window.localStorage, controls)

  function syncControlsFromAppState(): void {
    if (!getBridge()) return

    syncUiControlsToPreferences(window.localStorage, controls, {
      displaySeconds: state.displaySeconds,
      position: state.position,
    })
  }

  if (displaySecondsCheckbox) {
    displaySecondsCheckbox.addEventListener('change', async () => {
      const checked = displaySecondsCheckbox.checked
      saveDisplaySecondsUiSetting(window.localStorage, checked)
      try {
        await setDisplaySecondsPreference(checked)
        await showTime()
        rescheduleUpdateTimer()
        updateStatus(`Display seconds ${checked ? 'on' : 'off'}`)
      } catch (e) {
        console.error('[ui] failed to save display seconds', e)
        updateStatus('Failed to save Display seconds')
      }
    })
  }

  if (positionSelect) {
    positionSelect.addEventListener('change', async () => {
      const position = positionSelect.value as PositionType
      savePositionUiSetting(window.localStorage, position)
      try {
        await setPositionPreference(position)
        await showTime()
        updateStatus(`Position: ${position}`)
      } catch (e) {
        console.error('[ui] failed to save position', e)
        updateStatus('Failed to save Position')
      }
    })
  }

  const actions = await app.createActions(updateStatusDebounced)

  let connectInFlight = false
  let reconnectAttempt = 0
  let reconnectTimerId: number | null = null

  function clearReconnectTimer(): void {
    if (reconnectTimerId !== null) {
      window.clearTimeout(reconnectTimerId)
      reconnectTimerId = null
    }
  }

  function resetReconnectState(): void {
    reconnectAttempt = 0
    clearReconnectTimer()
  }

  async function tryConnect(source: 'auto' | 'manual'): Promise<void> {
    if (connectInFlight) {
      return
    }

    connectInFlight = true
    if (source === 'manual') {
      resetReconnectState()
    }

    try {
      await actions.connect()
      if (getBridge()) {
        syncControlsFromAppState()
        resetReconnectState()
        return
      }

      if (source === 'auto') {
        const nextAttempt = reconnectAttempt + 1
        const delayMs = getReconnectDelayMs(nextAttempt)
        reconnectAttempt = nextAttempt
        updateStatus(formatReconnectStatus(delayMs, nextAttempt))
        clearReconnectTimer()
        reconnectTimerId = window.setTimeout(() => {
          reconnectTimerId = null
          void tryConnect('auto')
        }, delayMs)
      }
    } catch (e) {
      console.error('[ui] connect attempt failed', e)
      updateStatus('Connect failed')
      if (source === 'auto') {
        const nextAttempt = reconnectAttempt + 1
        const delayMs = getReconnectDelayMs(nextAttempt)
        reconnectAttempt = nextAttempt
        updateStatus(formatReconnectStatus(delayMs, nextAttempt))
        clearReconnectTimer()
        reconnectTimerId = window.setTimeout(() => {
          reconnectTimerId = null
          void tryConnect('auto')
        }, delayMs)
      }
    } finally {
      connectInFlight = false
    }
  }

  connectBtn?.addEventListener('click', async () => {
    connectBtn.disabled = true
    try { await tryConnect('manual') }
    catch (e) { console.error(e); updateStatus('Connect failed') }
    finally { connectBtn.disabled = false }
  })

  actionBtn?.addEventListener('click', async () => {
    actionBtn.disabled = true
    try { await actions.action() }
    catch (e) { console.error(e); updateStatus('Action failed') }
    finally { actionBtn.disabled = false }
  })

  void tryConnect('auto').catch((e) => {
    console.error('[app-loader] auto-connect failed', e)
  })
}

void boot().catch((e) => {
  console.error('[app-loader] boot failed', e)
  updateStatus('App boot failed')
})