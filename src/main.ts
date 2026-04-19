import type { AppModule } from '../_shared/app-types'
import { setDisplaySecondsPreference, showTime } from '../g2/renderer'
import { rescheduleUpdateTimer } from '../g2/app'

const DISPLAY_SECONDS_UI_KEY = 'er-clock-displaySeconds-ui'

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

async function boot() {
  const module = await import('../g2/index')
  const app: AppModule = module.app ?? module.default

  const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null
  const actionBtn = document.getElementById('actionBtn') as HTMLButtonElement | null
  const displaySecondsCheckbox = document.getElementById('displaySeconds') as HTMLInputElement | null

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