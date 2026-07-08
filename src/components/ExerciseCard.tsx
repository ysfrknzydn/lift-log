import type { ExerciseEntry } from '../lib/types'
import type { LastPerformance } from '../lib/analytics'

interface Props {
  exercise: ExerciseEntry
  lastPerformance?: LastPerformance
  onChange: (updated: ExerciseEntry) => void
  onRemove: () => void
}

export default function ExerciseCard({ exercise, lastPerformance, onChange, onRemove }: Props) {
  const update = (patch: Partial<ExerciseEntry>) => onChange({ ...exercise, ...patch })

  const updateSet = (idx: number, patch: Partial<ExerciseEntry['sets'][number]>) => {
    const sets = exercise.sets.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    update({ sets })
  }

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1]
    update({
      sets: [...exercise.sets, { reps: null, weight: last?.weight ?? exercise.plannedWeight }],
    })
  }

  const removeSet = (idx: number) => {
    update({ sets: exercise.sets.filter((_, i) => i !== idx) })
  }

  const bumpPlanned = (delta: number) => {
    const next = Math.max(0, exercise.plannedWeight + delta)
    update({ plannedWeight: next })
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-start justify-between gap-2">
        <input
          value={exercise.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Exercise name"
          className="w-full bg-transparent text-base font-semibold text-neutral-100 outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-neutral-500 active:bg-neutral-800"
          aria-label="Remove exercise"
        >
          ✕
        </button>
      </div>

      {lastPerformance && (
        <p className="mt-0.5 text-xs text-neutral-500">
          Last ({lastPerformance.date.slice(5)}): {lastPerformance.setsSummary} @ planned{' '}
          {lastPerformance.plannedWeight}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => update({ skipped: !exercise.skipped })}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
            exercise.skipped
              ? 'bg-red-500/20 text-red-400'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {exercise.skipped ? 'Skipped' : 'Skip'}
        </button>

        {!exercise.skipped && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => bumpPlanned(-5)}
              className="h-7 w-7 rounded-lg bg-neutral-800 text-neutral-300 active:bg-neutral-700"
            >
              −
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={exercise.plannedWeight}
              onChange={(e) => update({ plannedWeight: Number(e.target.value) || 0 })}
              className="w-14 rounded-lg bg-neutral-800 py-1 text-center text-sm text-neutral-100 outline-none"
            />
            <button
              type="button"
              onClick={() => bumpPlanned(5)}
              className="h-7 w-7 rounded-lg bg-neutral-800 text-neutral-300 active:bg-neutral-700"
            >
              +
            </button>
            <span className="text-xs text-neutral-500">lbs planned</span>
          </div>
        )}
      </div>

      {!exercise.skipped && (
        <div className="mt-3 space-y-1.5">
          {exercise.sets.map((set, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-5 text-xs text-neutral-500">{idx + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                value={set.weight}
                onChange={(e) => updateSet(idx, { weight: Number(e.target.value) || 0 })}
                placeholder="lbs"
                className="w-16 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-center text-sm text-neutral-100 outline-none focus:border-purple-500"
              />
              <span className="text-neutral-600">×</span>
              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ''}
                onChange={(e) =>
                  updateSet(idx, { reps: e.target.value === '' ? null : Number(e.target.value) })
                }
                placeholder="reps"
                className="w-16 rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-center text-sm text-neutral-100 outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => removeSet(idx)}
                className="ml-auto rounded-lg px-2 py-1 text-xs text-neutral-600 active:bg-neutral-800"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSet}
            className="mt-1 w-full rounded-lg border border-dashed border-neutral-700 py-1.5 text-xs font-medium text-neutral-400 active:bg-neutral-800"
          >
            + Add set
          </button>
        </div>
      )}

      <input
        value={exercise.notes}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Notes (e.g. subbed for X, machine taken)"
        className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-300 outline-none placeholder:text-neutral-600 focus:border-purple-500"
      />
    </div>
  )
}
