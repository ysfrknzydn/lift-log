# Lift Log

Personal gym workout tracker — a PWA for logging a Push/Pull/Legs/Upper/Lower
split, tracking weekly progression, and exporting sessions as plain text.

Not published anywhere; runs locally or from wherever you deploy it yourself.

## Develop

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs a static `dist/` — deployable to any static host (Vercel, Netlify,
GitHub Pages, Cloudflare Pages) or opened directly. Add to iPhone home screen
from Safari for full-screen, offline-capable use.

## Data

Everything is stored in the browser's `localStorage` on-device — no accounts,
no backend, no sync. Use the History tab's copy-to-clipboard export to back
up or move sessions into another app (e.g. Notes).
