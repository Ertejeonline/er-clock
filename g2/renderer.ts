import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { state, getBridge } from './state'

export const DISPLAY_SECONDS_KEY = 'er-clock-displaySeconds'

function getCurrentTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    ...(state.displaySeconds ? { second: '2-digit' } : {}),
  })
}

async function loadDisplaySecondsSetting(): Promise<void> {
  const b = getBridge()
  if (!b) return

  try {
    const raw = await b.getLocalStorage(DISPLAY_SECONDS_KEY)
    state.displaySeconds = raw === '' ? true : raw === 'true'
  } catch (err) {
    console.warn('[clock] failed to load displaySeconds setting', err)
    state.displaySeconds = true
  }
}

export async function setDisplaySecondsPreference(value: boolean): Promise<void> {
  state.displaySeconds = value

  const b = getBridge()
  if (!b) return

  try {
    await b.setLocalStorage(DISPLAY_SECONDS_KEY, String(value))
  } catch (err) {
    console.warn('[clock] failed to persist displaySeconds setting', err)
  }
}

export async function showTime(): Promise<void> {
  const b = getBridge()
  if (!b) return

  await loadDisplaySecondsSetting()
  const time = getCurrentTime()

  if (!state.startupRendered) {
    await b.createStartUpPageContainer(new CreateStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [
        new TextContainerProperty({
          containerID: 1,
          containerName: 'time',
          content: time,
          xPosition: 0,
          yPosition: 0,
          width: 576,
          height: 288,
        }),
      ],
    }))
    state.startupRendered = true
  } else {
    await b.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'time',
        content: time,
      }),
    )
  }
}