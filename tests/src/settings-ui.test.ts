import { describe, expect, it } from 'vitest'
import {
  applyUiPreferencesToControls,
  initializeUiControlsFromCache,
  loadUiPreferences,
  syncUiControlsToPreferences,
  type UiSettingsControls,
} from '../../src/settings-ui'

function createStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial))

  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }
}

function createControls(): Required<UiSettingsControls> {
  return {
    displaySecondsCheckbox: { checked: true },
    positionSelect: { value: 'center' },
  }
}

describe('settings-ui', () => {
  it('loads cached preferences with safe defaults', () => {
    expect(loadUiPreferences(createStorage())).toEqual({
      displaySeconds: true,
      position: 'center',
    })

    expect(loadUiPreferences(createStorage({
      'er-clock-displaySeconds-ui': 'false',
      'er-clock-position-ui': 'bottomright',
    }))).toEqual({
      displaySeconds: false,
      position: 'bottomright',
    })
  })

  it('initializes controls from cached browser settings', () => {
    const controls = createControls()

    initializeUiControlsFromCache(createStorage({
      'er-clock-displaySeconds-ui': 'false',
      'er-clock-position-ui': 'topright',
    }), controls)

    expect(controls.displaySecondsCheckbox.checked).toBe(false)
    expect(controls.positionSelect.value).toBe('topright')
  })

  it('syncs controls and browser cache to bridge-loaded app preferences', () => {
    const storage = createStorage({
      'er-clock-displaySeconds-ui': 'true',
      'er-clock-position-ui': 'center',
    })
    const controls = createControls()

    applyUiPreferencesToControls(controls, {
      displaySeconds: true,
      position: 'center',
    })

    syncUiControlsToPreferences(storage, controls, {
      displaySeconds: false,
      position: 'bottomleft',
    })

    expect(controls.displaySecondsCheckbox.checked).toBe(false)
    expect(controls.positionSelect.value).toBe('bottomleft')
    expect(loadUiPreferences(storage)).toEqual({
      displaySeconds: false,
      position: 'bottomleft',
    })
  })
})