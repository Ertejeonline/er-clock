# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
