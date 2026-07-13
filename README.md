# Lift Log

Personal gym workout tracker — a PWA for logging a Push/Pull/Legs/Upper/Lower
split, tracking weekly progression, and exporting sessions as plain text.

Single-user tool, not distributed to anyone else. Deployed at
[ysfrknzydn.github.io/lift-log](https://ysfrknzydn.github.io/lift-log/) — add
it to your iPhone home screen from Safari for full-screen, offline-capable
use.

## Features

- **Log tab**: pick a split day and it clones last time's exercises (name +
  weights) as a starting point, with reps left blank for fresh entry each
  set. Weight/reps use tap-to-edit number fields with +/- steppers.
- **Progression suggestions**: an exercise gets a small "↑ +5 this week"
  badge when last time's sets all hit 8+ reps (time to add weight) or your
  estimated 1RM trended up over the last two sessions. Indicator only —
  never changes any values for you.
- **Substitutions**: hit "Sub exercise" to swap in a different exercise for
  one session (e.g. machine taken). The substitute is tracked as its own
  exercise with its own history/Progress line; next time, the original
  exercise comes back as the default — a sub is a one-off, not a permanent
  swap.
- **History tab**: browse past sessions, delete one, or export as plain
  text.
- **Progress tab**: per-exercise weight/est. 1RM trend chart, plus a
  "stalled" callout for anything with no top-weight gain in 3+ sessions.

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
