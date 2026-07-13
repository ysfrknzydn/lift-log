import type { WorkoutSession } from './types'

function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatSessionAsText(session: WorkoutSession): string {
  const lines: string[] = [`${session.splitDay} — ${formatDate(session.date)}`]
  for (const ex of session.exercises) {
    if (ex.skipped) {
      lines.push(`${ex.name}: skipped`)
      continue
    }
    const setsText = ex.sets
      .map((s) => (s.reps != null ? `${s.weight}x${s.reps}` : `${s.weight}x_`))
      .join(', ')
    const notes = ex.notes ? ` (${ex.notes})` : ''
    const subNote = ex.substitutedFrom ? ` [sub for ${ex.substitutedFrom}]` : ''
    lines.push(`${ex.name}${subNote}: ${setsText}${notes}`)
  }
  return lines.join('\n')
}

export function formatSessionsAsText(sessions: WorkoutSession[]): string {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map(formatSessionAsText).join('\n\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
