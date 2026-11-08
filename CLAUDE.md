# ER Clock (Even G2)

Shows the current time on the G2 display, with configurable position (top-left, top-right, center, bottom-left, bottom-right) and seconds on/off. Version 1.1.4, package `com.er.clock`, author Ertehe. Repo: https://github.com/Ertejeonline/er-clock

Read `../CLAUDE.md` for shared G2 rules. Feature list is in `README.md`; release notes in `CHANGELOG.md`.

## Layout
- `g2/` - glasses app: `main.ts`, `app.ts`, `renderer.ts`, `events.ts`, `state.ts`, `index.ts`
- `src/` - browser UI: `main.ts`, `settings-ui.ts`, `connect-retry.ts`, `styles.css`
- `_shared/` - types, logging, background-state wrapper, bridge serializer
- `resources/` - SDK skill docs (also copied into `../.claude/skills/`)
- `tests/` - Vitest tests (`tests/g2`, `tests/shared`, `tests/src`)

## Commands
- `npm install`, `npm run dev`, `npm run simulator`, `npm run test`, `npm run pack` (outputs `er-clock.ehpk`)
- `npm run qr` has the LAN IP `192.168.1.45` hardcoded in package.json. Update it if your machine's IP changes.

## App-specific rules
- Rendering: update text in place when only the time changes; rebuild the container only when the position changes.
- Settings persist to device local storage and sync back to the browser UI on reconnect.
- Double tap exits via the OS dialog. Disconnect does NOT auto-reconnect; the user taps Connect again. Keep this behavior.
- Timer loop must recover from transient errors instead of stopping. Foreground listeners (`pageshow`, `visibilitychange`) keep timers aligned.
- Bump `version` in `package.json` and `app.json` for each release and add a CHANGELOG entry.
