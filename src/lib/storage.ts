import { SPLIT_DAYS, type WorkoutSession, type SplitDay } from './types'

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

export function exportSessionsAsJson(): string {
  return JSON.stringify(loadSessions(), null, 2)
}

function isValidSession(s: unknown): s is WorkoutSession {
  if (typeof s !== 'object' || s === null) return false
  const obj = s as Record<string, unknown>
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.splitDay === 'string' &&
    (SPLIT_DAYS as readonly string[]).includes(obj.splitDay) &&
    Array.isArray(obj.exercises)
  )
}

/** Parses and applies a backup file. Throws if the file has no valid sessions. */
export function importSessions(json: string, mode: 'replace' | 'merge'): WorkoutSession[] {
  const parsed: unknown = JSON.parse(json)
  if (!Array.isArray(parsed)) throw new Error('Backup file must contain a list of sessions')
  const valid = parsed.filter(isValidSession)
  if (valid.length === 0) throw new Error('No valid sessions found in backup file')

  if (mode === 'replace') {
    saveSessions(valid)
    return loadSessions()
  }

  const existing = loadSessions()
  const existingIds = new Set(existing.map((s) => s.id))
  const merged = [...existing, ...valid.filter((s) => !existingIds.has(s.id))]
  saveSessions(merged)
  return loadSessions()
}
