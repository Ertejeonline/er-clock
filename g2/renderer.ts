import {
  CreateStartUpPageContainer,
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
} from '@evenrealities/even_hub_sdk'
import { state, getBridge, type PositionType } from './state'

export const DISPLAY_SECONDS_KEY = 'er-clock-displaySeconds'
export const POSITION_KEY = 'er-clock-position'

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

function getPositionCoordinates(position: PositionType): { x: number; y: number } {
  switch (position) {
    case 'topleft':
      return { x: 0, y: 0 }
    case 'topright':
      return { x: 496, y: 0 }
    case 'center':
      return { x: 248, y: 124 }
    case 'bottomleft':
      return { x: 0, y: 248 }
    case 'bottomright':
      return { x: 496, y: 248 }
  }
}

async function loadPositionSetting(): Promise<void> {
  const b = getBridge()
  if (!b) return

  try {
    const raw = await b.getLocalStorage(POSITION_KEY)
    const validPositions: PositionType[] = ['topleft', 'topright', 'center', 'bottomleft', 'bottomright']
    state.position = (validPositions.includes(raw as PositionType) ? raw : 'center') as PositionType
  } catch (err) {
    console.warn('[clock] failed to load position setting', err)
    state.position = 'center'
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

export async function setPositionPreference(position: PositionType): Promise<void> {
  state.position = position

  const b = getBridge()
  if (!b) return

  try {
    await b.setLocalStorage(POSITION_KEY, position)
  } catch (err) {
    console.warn('[clock] failed to persist position setting', err)
  }
}

export async function showTime(): Promise<void> {
  const b = getBridge()
  if (!b) return

  await loadDisplaySecondsSetting()
  await loadPositionSetting()
  const time = getCurrentTime()
  const coords = getPositionCoordinates(state.position)

  if (!state.startupRendered) {
    await b.createStartUpPageContainer(new CreateStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [
        new TextContainerProperty({
          containerID: 1,
          containerName: 'time',
          content: time,
          xPosition: coords.x,
          yPosition: coords.y,
          width: 80,
          height: 40,
        }),
      ],
    }))
    state.startupRendered = true
    state.lastRenderedPosition = state.position
  } else if (state.position !== state.lastRenderedPosition) {
    // Position changed, rebuild the container at new location
    await b.rebuildPageContainer(
      new RebuildPageContainer({
        containerTotalNum: 1,
        textObject: [
          new TextContainerProperty({
            containerID: 1,
            containerName: 'time',
            content: time,
            xPosition: coords.x,
            yPosition: coords.y,
            width: 80,
            height: 40,
          }),
        ],
      }),
    )
    state.lastRenderedPosition = state.position
  } else {
    // Only update content
    await b.textContainerUpgrade(
      new TextContainerUpgrade({
        containerID: 1,
        containerName: 'time',
        content: time,
      }),
    )
  }
}