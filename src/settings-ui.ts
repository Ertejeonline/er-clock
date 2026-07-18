import type { PositionType } from '../g2/state'

export type ClockPreferences = {
  displaySeconds: boolean
  position: PositionType
}

export type UiSettingsControls = {
  displaySecondsCheckbox?: { checked: boolean } | null
  positionSelect?: { value: string } | null
}

type StorageReader = Pick<Storage, 'getItem'>
type StorageWriter = Pick<Storage, 'setItem'>
type StorageLike = StorageReader & StorageWriter

export const DISPLAY_SECONDS_UI_KEY = 'er-clock-displaySeconds-ui'
export const POSITION_UI_KEY = 'er-clock-position-ui'

const VALID_POSITIONS: PositionType[] = ['topleft', 'topright', 'center', 'bottomleft', 'bottomright']

export function loadDisplaySecondsUiSetting(storage: StorageReader): boolean {
  const raw = storage.getItem(DISPLAY_SECONDS_UI_KEY)
  return raw !== 'false'
}

export function saveDisplaySecondsUiSetting(storage: StorageWriter, value: boolean): void {
  storage.setItem(DISPLAY_SECONDS_UI_KEY, value ? 'true' : 'false')
}

export function loadPositionUiSetting(storage: StorageReader): PositionType {
  const raw = storage.getItem(POSITION_UI_KEY)
  return VALID_POSITIONS.includes(raw as PositionType) ? (raw as PositionType) : 'center'
}

export function savePositionUiSetting(storage: StorageWriter, value: PositionType): void {
  storage.setItem(POSITION_UI_KEY, value)
}

export function loadUiPreferences(storage: StorageReader): ClockPreferences {
  return {
    displaySeconds: loadDisplaySecondsUiSetting(storage),
    position: loadPositionUiSetting(storage),
  }
}

export function applyUiPreferencesToControls(controls: UiSettingsControls, preferences: ClockPreferences): void {
  if (controls.displaySecondsCheckbox) {
    controls.displaySecondsCheckbox.checked = preferences.displaySeconds
  }

  if (controls.positionSelect) {
    controls.positionSelect.value = preferences.position
  }
}

export function initializeUiControlsFromCache(storage: StorageReader, controls: UiSettingsControls): void {
  applyUiPreferencesToControls(controls, loadUiPreferences(storage))
}

export function syncUiControlsToPreferences(
  storage: StorageLike,
  controls: UiSettingsControls,
  preferences: ClockPreferences,
): void {
  saveDisplaySecondsUiSetting(storage, preferences.displaySeconds)
  savePositionUiSetting(storage, preferences.position)
  applyUiPreferencesToControls(controls, preferences)
}