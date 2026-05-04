# ER Clock

Displays the current time on Even Realities G2 smart glasses. The time updates automatically and the display position can be configured via the browser UI.

**Version:** 1.0.4 — `com.er.clock`

## Features

- Displays current time on the G2 glasses display
- Configurable display position: top-left, top-right, center, bottom-left, bottom-right
- Toggle seconds display on/off
- Settings are persisted to device local storage and survive app restarts
- Efficient rendering: updates text in-place when only the time changes; only rebuilds the container when the position changes
- Double-tap exits the app via the host OS exit dialogue

## Project structure

```
g2/           Even G2 app logic (bridge, renderer, event handling, state)
src/          Browser UI (controls, status log)
_shared/      Shared types and logging utilities
```

## Development

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:5173
npm run qr        # print QR code to load on device (requires running dev server)
npm run simulator # open the Even Hub simulator against the dev server
npm run build     # production build to dist/
npm run pack      # build and package as er-clock.ehpk for Even Hub submission
```

## Deployment

1. Run `npm run pack` — produces `er-clock.ehpk`
2. Install via the Even Hub app or upload to Even Hub for review

## Requirements

- Even Hub SDK `^0.0.10`
- Even Hub CLI `^0.1.11`
- Even Realities G2 glasses or the Even Hub simulator