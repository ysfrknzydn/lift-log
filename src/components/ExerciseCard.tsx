import type { ExerciseEntry, SetEntry } from '../lib/types'
import type { LastPerformance } from '../lib/analytics'

interface Props {
  exercise: ExerciseEntry
  lastPerformance?: LastPerformance
  onChange: (updated: ExerciseEntry) => void
  onRemove: () => void
}

function Stepper({
  value,
  onChange,
  step,
  placeholder,
}: {
  value: number | null
  onChange: (next: number | null) => void
  step: number
  placeholder: string
}) {
  const bump = (delta: number) => onChange(Math.max(0, (value ?? 0) + delta))

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => bump(-step)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-base font-medium text-neutral-300 active:bg-neutral-700"
        aria-label={`Decrease ${placeholder}`}
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        placeholder={placeholder}
        className="w-11 rounded-lg border border-neutral-800 bg-neutral-950 py-1.5 text-center text-base text-neutral-100 outline-none focus:border-purple-500"
      />
      <button
        type="button"
        onClick={() => bump(step)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-base font-medium text-neutral-300 active:bg-neutral-700"
        aria-label={`Increase ${placeholder}`}
      >
        +
      </button>
    </div>
  )
}

export default function ExerciseCard({ exercise, lastPerformance, onChange, onRemove }: Props) {
  const update = (patch: Partial<ExerciseEntry>) => onChange({ ...exercise, ...patch })

  const updateSet = (idx: number, patch: Partial<SetEntry>) => {
    const sets = exercise.sets.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    update({ sets })
  }

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1]
    update({ sets: [...exercise.sets, { reps: null, weight: last?.weight ?? 0 }] })
  }

  const removeSet = (idx: number) => {
    update({ sets: exercise.sets.filter((_, i) => i !== idx) })
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
          Last time ({lastPerformance.date.slice(5)}): {lastPerformance.setsSummary}
        </p>
      )}

      <button
        type="button"
        onClick={() => update({ skipped: !exercise.skipped })}
        className={`mt-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
          exercise.skipped ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400'
        }`}
      >
        {exercise.skipped ? 'Marked as skipped' : 'Skip this exercise'}
      </button>

      {!exercise.skipped && (
        <div className="mt-3 space-y-2">
          {exercise.sets.map((set, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="w-4 shrink-0 text-xs text-neutral-500">{idx + 1}</span>
              <Stepper
                value={set.weight}
                onChange={(v) => updateSet(idx, { weight: v ?? 0 })}
                step={5}
                placeholder="lbs"
              />
              <span className="shrink-0 text-neutral-600">×</span>
              <Stepper value={set.reps} onChange={(v) => updateSet(idx, { reps: v })} step={1} placeholder="reps" />
              <button
                type="button"
                onClick={() => removeSet(idx)}
                className="ml-auto shrink-0 rounded-lg px-2 py-1 text-xs text-neutral-600 active:bg-neutral-800"
                aria-label="Remove set"
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
