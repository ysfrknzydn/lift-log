export const SPLIT_DAYS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower'] as const

export type SplitDay = (typeof SPLIT_DAYS)[number]

export interface SetEntry {
  reps: number | null
  weight: number
}

export interface ExerciseEntry {
  id: string
  name: string
  sets: SetEntry[]
  skipped: boolean
  notes: string
}

export interface WorkoutSession {
  id: string
  date: string // YYYY-MM-DD
  splitDay: SplitDay
  exercises: ExerciseEntry[]
}
