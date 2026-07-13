# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Lift Log — a personal gym workout tracker, built as an installable PWA (add
to iPhone home screen, works offline). Not published anywhere beyond a
public GitHub Pages deploy needed for install; there is no backend, no
accounts, and no intent to distribute this to other users. Keep additions
scoped accordingly — this is a single-user tool, not a product.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # tsc -b (typecheck) then vite build -> dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
```

There is no test suite. Verify changes with `npm run build` (typecheck +
production build) and by exercising the UI in a browser — most logic lives
in plain functions in `src/lib/` that are easy to sanity-check directly if
needed.

## Deployment

Pushing to `main` auto-deploys via `.github/workflows/deploy.yml` (GitHub
Actions → GitHub Pages) to `https://ysfrknzydn.github.io/lift-log/`. The
site is served from the `/lift-log/` subpath, not root — this is why
`vite.config.ts` sets `base` and why the PWA manifest/icons and
`index.html`'s icon links use `%BASE_URL%`/`base`-relative paths rather than
absolute `/` paths. If either drifts from the other, icons or the manifest
break under Pages while still looking fine in local dev at `/`.

The GitHub token used for `gh`/git push needs the `workflow` OAuth scope to
push changes to `.github/workflows/*` (`gh auth refresh -s workflow` if a
push is rejected for this reason).

## Architecture

**Data model** (`src/lib/types.ts`): a `WorkoutSession` is one gym visit —
`date` + `splitDay` (Push/Pull/Legs/Upper/Lower) + a list of
`ExerciseEntry`, each with only a name and a list of per-set
`{ reps, weight }` — there is no separate "planned" or "target" weight field.
An earlier version had one (`plannedWeight`); it was removed because it was
never read by analytics (1RM/stalled detection use each set's actual
weight) and, being a second editable number sitting next to the real set
weights, it was confusing in the UI ("is this what I planned or what I
did?"). If a future feature wants a target/plan concept, don't resurrect a
bare number field — make the distinction visually unmistakable.

**Storage** (`src/lib/storage.ts`): everything lives in a single
`localStorage` key (`lift-log:sessions`) as a JSON array, read/written in
full on every mutation — there is no IndexedDB, no sync, no backend. Only
`loadSessions`, `upsertSession`, and `deleteSession` should touch
`localStorage` directly.

**Progression workflow** (`src/components/LogTab.tsx`): selecting a split
day looks for an existing session matching `date + splitDay`; if none
exists, `buildTemplate()` clones the exercises (name, set weights, set
count) from the most recent past session with that same split day via
`getLastSessionFor`, leaving `reps` blank for fresh entry. This is how
"last week's plan becomes this week's starting point" works — there's no
separate "routine" or "template" entity, the previous session *is* the
template. Editing a cloned exercise's name effectively creates a new,
unrelated exercise for history-matching purposes (see below) — this is
intentional, it's how exercise substitutions are meant to be recorded.

**Autosave, not explicit save**: `LogTab` only calls `upsertSession`
(persists) from inside mutation handlers, never on the initial
template-load effect. This means opening a split day you don't end up
logging leaves no trace in History — only actual edits get persisted.
Preserve this distinction if touching the load/save flow.

**Exercise identity is name-based, case-insensitive**: history lookups
(`getLastPerformance`, `exerciseHistory`, `allExerciseNames` in
`src/lib/analytics.ts`) match exercises across sessions by
`name.toLowerCase()`, not by any stable id. Renaming an exercise in the UI
therefore breaks its historical trend line and starts a new one — treated
as a feature (substitution tracking), not a bug.

**Analytics** (`src/lib/analytics.ts`): estimated 1RM uses the Epley
formula. "Stalled" exercise detection (surfaced in
`src/components/ProgressTab.tsx`) flags any exercise whose top working
weight hasn't increased across its last 3+ logged sessions.

**Export** (`src/lib/export.ts`): formats one or more sessions as plain
text (`formatSessionsAsText`) matching a manual notes-app log style, copied
via the Clipboard API from the History tab. This is the only data
egress path — there is no file export/import.

**Code splitting**: `ProgressTab` (pulls in `recharts`) is lazy-loaded from
`App.tsx` so the Log tab — the one opened most, mid-workout — isn't gated
on a chart library download.

**Styling**: Tailwind v4, CSS-first config (`@import 'tailwindcss'` in
`src/index.css`, no `tailwind.config.js`). Dark theme only, mobile-first,
fixed bottom tab nav sized for one-handed thumb use at a gym.
