import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { WorkoutSession } from '../lib/types'
import { loadSessions } from '../lib/storage'
import { allExerciseNames, exerciseHistory } from '../lib/analytics'

interface StalledInfo {
  name: string
  sessionsSinceGain: number
}

function findStalled(sessions: WorkoutSession[]): StalledInfo[] {
  const names = allExerciseNames(sessions)
  const stalled: StalledInfo[] = []
  for (const name of names) {
    const history = exerciseHistory(sessions, name)
    if (history.length < 3) continue
    const latest = history[history.length - 1]
    let sessionsSinceGain = 0
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].topWeight < latest.topWeight) break
      sessionsSinceGain++
    }
    if (sessionsSinceGain >= 3) {
      stalled.push({ name, sessionsSinceGain })
    }
  }
  return stalled.sort((a, b) => b.sessionsSinceGain - a.sessionsSinceGain)
}

export default function ProgressTab() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [selected, setSelected] = useState<string>('')

  useEffect(() => {
    setSessions(loadSessions())
  }, [])

  const names = useMemo(() => allExerciseNames(sessions), [sessions])
  const stalled = useMemo(() => findStalled(sessions), [sessions])
  const history = useMemo(
    () => (selected ? exerciseHistory(sessions, selected) : []),
    [sessions, selected],
  )

  useEffect(() => {
    if (!selected && names.length > 0) setSelected(names[0])
  }, [names, selected])

  const chartData = history.map((h) => ({
    date: h.date.slice(5),
    'Top weight': h.topWeight,
    'Est. 1RM': Math.round(h.best1RM),
  }))

  return (
    <div className="px-4 pt-6">
      <h1 className="text-lg font-semibold text-neutral-100">Progress</h1>

      {sessions.length === 0 && (
        <p className="mt-8 text-center text-sm text-neutral-500">
          Log a few sessions to start seeing trends.
        </p>
      )}

      {stalled.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-xs font-semibold text-amber-400">Stalled — consider swapping or deloading</p>
          <ul className="mt-1.5 space-y-0.5">
            {stalled.map((s) => (
              <li key={s.name} className="text-xs text-amber-300/90">
                {s.name} — no top-weight gain in {s.sessionsSinceGain} sessions
              </li>
            ))}
          </ul>
        </div>
      )}

      {names.length > 0 && (
        <>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="mt-4 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-100 outline-none"
          >
            {names.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {chartData.length > 1 ? (
            <div className="mt-4 h-64 rounded-xl border border-neutral-800 bg-neutral-900 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="date" tick={{ fill: '#737373', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: 8 }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Line type="monotone" dataKey="Top weight" stroke="#c084fc" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Est. 1RM" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-neutral-500">
              Need at least 2 logged sessions of this exercise to chart a trend.
            </p>
          )}
        </>
      )}
    </div>
  )
}
