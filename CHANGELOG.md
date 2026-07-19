# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.4] - 2026-07-20

### Fixed
- Fixed clock display freezing after the app returned to the foreground (empty `visibilitychange`/`pageshow` handlers previously left the update timer stopped)
- Added `state.appInForeground` as the single source of truth for foreground/background tracking, with a matching guard in the tick loop
- Added SDK-level `FOREGROUND_ENTER_EVENT`/`FOREGROUND_EXIT_EVENT` handling as defense-in-depth alongside browser visibility events
- Serialized all BLE bridge calls (renders and local storage reads/writes) through a shared queue with per-call timeouts to prevent concurrent bridge operations from corrupting state or hanging
- Made bridge listener cleanup defer `unsubscribe()` calls to avoid a race where a listener unsubscribes itself mid-callback

## [1.1.3] - 2026-07-19

### Changed
- Removed automatic bridge reconnect/relaunch after abnormal/system exit events, device disconnects, renderer failures, and failed manual updates
- All disconnect/error paths now stay stopped and require an explicit manual Connect action

## [1.1.2] - 2026-07-18

### Fixed
- Prevented the app from auto-reconnecting after a user-confirmed exit from the glasses double-tap exit dialog
- Added exit-dialog transition handling so dismissing the dialog does not suppress normal reconnect recovery

## [1.1.1] - 2026-07-18

### Added
- Browser-side reconnect backoff helper utilities with unit tests

### Changed
- Browser UI connection flow now debounces rapid status updates to reduce flicker in the status panel
- Auto-connect now retries with visible backoff messages (`Reconnect in Ns (attempt X)`) when the bridge is unavailable
- Manual connect now cancels pending auto-retry timers before attempting an immediate reconnect

## [1.1.0] - 2026-07-18

### Added
- Background state persistence for clock runtime state (display seconds, position, and active container state) to survive phone background/headless WebView migration
- Automatic reconnection after bridge disconnects, abnormal/system exit events, and repeated renderer failures
- Device status disconnect monitoring via `onDeviceStatusChanged`
- Unit tests for background-state snapshot and restore behavior

### Changed
- Bridge event handling and initialization now run with error guards so isolated failures do not stop the app lifecycle
- Time refresh scheduling now recovers from individual tick failures instead of halting updates
- Lifecycle listeners now include `pageshow` and `visibilitychange` to recover when the WebView returns to foreground

### Fixed
- Connection state no longer remains stale after failed initialization or failed manual refresh
- Renderer write failures now trigger controlled recovery instead of silently accumulating failures

## [1.0.5] - 2026-07-18

### Fixed
- Synced the browser `Display seconds` and position controls from the bridge-persisted app settings after connect
- Preserved the last saved settings across app restarts without showing stale browser-only control state

### Added
- Unit tests for settings UI cache and sync behavior

## [1.0.4] - 2026-05-04

### Added
- Exit option accessible from the glasses

### Changed
- Clock now refreshes every second
- Improved settings update handling

## [1.0.2] - 2026-04-19

### Added
- Clock position option (top-left / centre)
- Seconds display option
- Styled options UI

## [1.0.0] - 2026-04-19

### Added
- Initial release
- Displays current time on Even G2 glasses
