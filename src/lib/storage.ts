import type { WorkoutSession, SplitDay } from './types'

const STORAGE_KEY = 'lift-log:sessions'

export function loadSessions(): WorkoutSession[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as WorkoutSession[]
    return parsed.sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    return []
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function upsertSession(session: WorkoutSession): WorkoutSession[] {
  const sessions = loadSessions()
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx === -1) {
    sessions.push(session)
  } else {
    sessions[idx] = session
  }
  const sorted = sessions.sort((a, b) => b.date.localeCompare(a.date))
  saveSessions(sorted)
  return sorted
}

export function deleteSession(id: string): WorkoutSession[] {
  const sessions = loadSessions().filter((s) => s.id !== id)
  saveSessions(sessions)
  return sessions
}

/** Most recent past session for a given split day, excluding a specific session id. */
export function getLastSessionFor(
  splitDay: SplitDay,
  excludeId?: string,
): WorkoutSession | undefined {
  return loadSessions().find((s) => s.splitDay === splitDay && s.id !== excludeId)
}

export function newId(): string {
  return crypto.randomUUID()
}
