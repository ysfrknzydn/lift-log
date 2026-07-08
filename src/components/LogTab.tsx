import { useEffect, useMemo, useState } from 'react'
import { SPLIT_DAYS, type ExerciseEntry, type SplitDay, type WorkoutSession } from '../lib/types'
import { getLastSessionFor, loadSessions, newId, upsertSession } from '../lib/storage'
import { getLastPerformance } from '../lib/analytics'
import ExerciseCard from './ExerciseCard'

function today(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

function buildTemplate(date: string, splitDay: SplitDay): WorkoutSession {
  const last = getLastSessionFor(splitDay)
  const exercises: ExerciseEntry[] = (last?.exercises ?? [])
    .filter((ex) => !ex.skipped)
    .map((ex) => ({
      id: newId(),
      name: ex.name,
      plannedWeight: ex.plannedWeight,
      sets: ex.sets.map((s) => ({ reps: null, weight: s.weight || ex.plannedWeight })),
      skipped: false,
      notes: '',
    }))
  return { id: newId(), date, splitDay, exercises }
}

export default function LogTab() {
  const [date, setDate] = useState(today())
  const [splitDay, setSplitDay] = useState<SplitDay | null>(null)
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([])

  useEffect(() => {
    setAllSessions(loadSessions())
  }, [])

  useEffect(() => {
    if (!splitDay) {
      setSession(null)
      return
    }
    const sessions = loadSessions()
    const existing = sessions.find((s) => s.date === date && s.splitDay === splitDay)
    setSession(existing ?? buildTemplate(date, splitDay))
  }, [date, splitDay])

  const persist = (next: WorkoutSession) => {
    setSession(next)
    const sessions = upsertSession(next)
    setAllSessions(sessions)
  }

  const updateExercise = (idx: number, updated: ExerciseEntry) => {
    if (!session) return
    const exercises = session.exercises.map((ex, i) => (i === idx ? updated : ex))
    persist({ ...session, exercises })
  }

  const removeExercise = (idx: number) => {
    if (!session) return
    persist({ ...session, exercises: session.exercises.filter((_, i) => i !== idx) })
  }

  const addExercise = () => {
    if (!session) return
    const blank: ExerciseEntry = {
      id: newId(),
      name: '',
      plannedWeight: 0,
      sets: [{ reps: null, weight: 0 }],
      skipped: false,
      notes: '',
    }
    persist({ ...session, exercises: [...session.exercises, blank] })
  }

  const lastPerformances = useMemo(() => {
    if (!session) return new Map<string, ReturnType<typeof getLastPerformance>>()
    const map = new Map<string, ReturnType<typeof getLastPerformance>>()
    for (const ex of session.exercises) {
      if (!ex.name) continue
      map.set(ex.id, getLastPerformance(allSessions, ex.name, session.id))
    }
    return map
  }, [session, allSessions])

  return (
    <div className="px-4 pt-6">
      <h1 className="text-lg font-semibold text-neutral-100">Log workout</h1>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none"
        />
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {SPLIT_DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSplitDay(d)}
            className={`rounded-lg py-2 text-xs font-medium ${
              splitDay === d
                ? 'bg-purple-500 text-white'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {session && (
        <div className="mt-5 space-y-3">
          {session.exercises.length === 0 && (
            <p className="rounded-xl border border-dashed border-neutral-800 p-4 text-center text-sm text-neutral-500">
              No exercises yet — add your first one below.
            </p>
          )}
          {session.exercises.map((ex, idx) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              lastPerformance={lastPerformances.get(ex.id)}
              onChange={(updated) => updateExercise(idx, updated)}
              onRemove={() => removeExercise(idx)}
            />
          ))}
          <button
            type="button"
            onClick={addExercise}
            className="w-full rounded-xl border border-dashed border-neutral-700 py-3 text-sm font-medium text-neutral-400 active:bg-neutral-900"
          >
            + Add exercise
          </button>
        </div>
      )}

      {!splitDay && (
        <p className="mt-8 text-center text-sm text-neutral-500">
          Pick a split day above to start today's log.
        </p>
      )}
    </div>
  )
}
