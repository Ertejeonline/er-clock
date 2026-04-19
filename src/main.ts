import type { AppModule } from '../_shared/app-types'
import { setDisplaySecondsPreference, setPositionPreference, showTime } from '../g2/renderer'
import { rescheduleUpdateTimer } from '../g2/app'
import type { PositionType } from '../g2/state'

const DISPLAY_SECONDS_UI_KEY = 'er-clock-displaySeconds-ui'
const POSITION_UI_KEY = 'er-clock-position-ui'

function updateStatus(text: string) {
  console.log(`[ui] ${text}`)
  const el = document.getElementById('status')
  if (el) el.textContent = text
}

function loadDisplaySecondsUiSetting(): boolean {
  const raw = window.localStorage.getItem(DISPLAY_SECONDS_UI_KEY)
  return raw !== 'false'
}

function saveDisplaySecondsUiSetting(value: boolean): void {
  window.localStorage.setItem(DISPLAY_SECONDS_UI_KEY, value ? 'true' : 'false')
}

function loadPositionUiSetting(): PositionType {
  const raw = window.localStorage.getItem(POSITION_UI_KEY)
  const validPositions: PositionType[] = ['topleft', 'topright', 'center', 'bottomleft', 'bottomright']
  return validPositions.includes(raw as PositionType) ? (raw as PositionType) : 'center'
}

function savePositionUiSetting(value: PositionType): void {
  window.localStorage.setItem(POSITION_UI_KEY, value)
}

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default

  const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null
  const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement | null
  const displaySecondsCheckbox = document.getElementById('displaySeconds') as HTMLInputElement | null
  const positionSelect = document.getElementById('positionSelect') as HTMLSelectElement | null

  document.title = `${app.name} – Even G2`
  updateStatus(app.initialStatus ?? `${app.name} app ready`)

  if (displaySecondsCheckbox) {
    displaySecondsCheckbox.checked = loadDisplaySecondsUiSetting()
    displaySecondsCheckbox.addEventListener('change', async () => {
      const checked = displaySecondsCheckbox.checked
      saveDisplaySecondsUiSetting(checked)
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
    positionSelect.value = loadPositionUiSetting()
    positionSelect.addEventListener('change', async () => {
      const position = positionSelect.value as PositionType
      savePositionUiSetting(position)
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

  const actions = await app.createActions(updateStatus)

  connectBtn?.addEventListener('click', async () => {
    connectBtn.disabled = true
    try { await actions.connect() }
    catch (e) { console.error(e); updateStatus('Connect failed') }
    finally { connectBtn.disabled = false }
  })

  actionBtn?.addEventListener('click', async () => {
    actionBtn.disabled = true
    try { await actions.action() }
    catch (e) { console.error(e); updateStatus('Action failed') }
    finally { actionBtn.disabled = false }
  })

  void actions.connect().catch((e) => {
    console.error('[app-loader] auto-connect failed', e)
  })
}

void boot().catch((e) => {
  console.error('[app-loader] boot failed', e)
  updateStatus('App boot failed')
})