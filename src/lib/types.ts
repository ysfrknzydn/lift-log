export const SPLIT_DAYS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower'] as const

export type SplitDay = (typeof SPLIT_DAYS)[number]

export interface SetEntry {
  reps: number | null
  weight: number
}

export interface ExerciseEntry {
  id: string
  name: string
  /** Set when `name` is a substitute performed instead of the originally planned
   *  exercise for this slot — e.g. name "Incline DB Press", substitutedFrom "Bench Press".
   *  Lets a substitute get tracked as its own exercise (own history, own Progress line)
   *  while the next template build still offers the original exercise back. */
  substitutedFrom?: string
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
