# Lift Log

Personal gym workout tracker — a PWA for logging a Push/Pull/Legs/Upper/Lower
split, tracking weekly progression, and exporting sessions as plain text.

Single-user tool, not distributed to anyone else. Deployed at
[ysfrknzydn.github.io/lift-log](https://ysfrknzydn.github.io/lift-log/) — add
it to your iPhone home screen from Safari for full-screen, offline-capable
use.

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
GitHub Pages, Cloudflare Pages) or opened directly.

## Deploy

Pushing to `main` auto-deploys to GitHub Pages via
`.github/workflows/deploy.yml`.

## Data

Everything is stored in the browser's `localStorage` on-device — no accounts,
no backend, no sync. Two ways to get data out:

- **History tab → Backup to file** — downloads a full JSON backup of every
  session; **Restore from file** loads one back in (replace or merge).
- **History tab → Copy to clipboard** — formats one or more sessions as plain
  text, for pasting into another app (e.g. Notes).
