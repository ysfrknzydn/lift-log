import type { WorkoutSession } from './types'

/** Epley formula estimated one-rep max. */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0) return 0
  return weight * (1 + reps / 30)
}

export function sessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    if (ex.skipped) return total
    return (
      total +
      ex.sets.reduce((s, set) => s + (set.reps ?? 0) * (set.weight || 0), 0)
    )
  }, 0)
}

export interface ExercisePoint {
  date: string
  sessionId: string
  topWeight: number
  best1RM: number
  totalReps: number
  volume: number
}

/** Chronological (oldest first) history of a single exercise by exact name match. */
export function exerciseHistory(
  sessions: WorkoutSession[],
  exerciseName: string,
): ExercisePoint[] {
  const points: ExercisePoint[] = []
  for (const session of sessions) {
    const ex = session.exercises.find(
      (e) => e.name.toLowerCase() === exerciseName.toLowerCase() && !e.skipped,
    )
    if (!ex) continue
    const validSets = ex.sets.filter((s) => s.reps != null && s.reps > 0)
    if (validSets.length === 0) continue
    const topWeight = Math.max(...validSets.map((s) => s.weight))
    const best1RM = Math.max(
      ...validSets.map((s) => estimatedOneRepMax(s.weight, s.reps ?? 0)),
    )
    const totalReps = validSets.reduce((sum, s) => sum + (s.reps ?? 0), 0)
    const volume = validSets.reduce((sum, s) => sum + (s.reps ?? 0) * s.weight, 0)
    points.push({ date: session.date, sessionId: session.id, topWeight, best1RM, totalReps, volume })
  }
  return points.sort((a, b) => a.date.localeCompare(b.date))
}

export interface LastPerformance {
  date: string
  plannedWeight: number
  setsSummary: string
}

/** Most recent previous performance of an exercise by name, excluding a given session. */
export function getLastPerformance(
  sessions: WorkoutSession[],
  exerciseName: string,
  excludeSessionId: string,
): LastPerformance | undefined {
  for (const session of sessions) {
    if (session.id === excludeSessionId) continue
    const ex = session.exercises.find(
      (e) => e.name.toLowerCase() === exerciseName.toLowerCase(),
    )
    if (!ex) continue
    if (ex.skipped) {
      return { date: session.date, plannedWeight: ex.plannedWeight, setsSummary: 'skipped' }
    }
    const setsSummary = ex.sets
      .filter((s) => s.reps != null)
      .map((s) => `${s.weight}x${s.reps}`)
      .join(', ')
    return { date: session.date, plannedWeight: ex.plannedWeight, setsSummary: setsSummary || '—' }
  }
  return undefined
}

/** All distinct exercise names ever logged, most recently used first. */
export function allExerciseNames(sessions: WorkoutSession[]): string[] {
  const seen = new Map<string, string>()
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const key = ex.name.toLowerCase()
      if (!seen.has(key)) seen.set(key, ex.name)
    }
  }
  return Array.from(seen.values())
}
