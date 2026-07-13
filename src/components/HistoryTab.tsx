import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { WorkoutSession } from '../lib/types'
import { deleteSession, exportSessionsAsJson, importSessions, loadSessions } from '../lib/storage'
import { copyToClipboard, formatSessionAsText, formatSessionsAsText } from '../lib/export'

export default function HistoryTab() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [copiedMsg, setCopiedMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSessions(loadSessions())
  }, [])

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleCopy = async (toCopy: WorkoutSession[]) => {
    if (toCopy.length === 0) return
    const text = formatSessionsAsText(toCopy)
    const ok = await copyToClipboard(text)
    setCopiedMsg(ok ? `Copied ${toCopy.length} session${toCopy.length > 1 ? 's' : ''} to clipboard` : 'Copy failed')
    setTimeout(() => setCopiedMsg(null), 2500)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    setSessions(deleteSession(id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const selectedSessions = sessions.filter((s) => selected.has(s.id))

  const handleExportBackup = () => {
    const json = exportSessionsAsJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lift-log-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setCopiedMsg('Backup file downloaded')
    setTimeout(() => setCopiedMsg(null), 2500)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const count = (JSON.parse(text) as unknown[]).length
      const replace = window.confirm(
        `Found ${count} session(s) in this backup.\n\nOK = Replace all local data with the backup\nCancel = Merge (keep existing sessions, add any new ones)`,
      )
      const updated = importSessions(text, replace ? 'replace' : 'merge')
      setSessions(updated)
      setCopiedMsg(`Backup ${replace ? 'restored (replaced)' : 'merged'} — ${updated.length} session(s) total`)
    } catch (err) {
      setCopiedMsg(err instanceof Error ? `Import failed: ${err.message}` : 'Import failed — invalid file')
    } finally {
      setTimeout(() => setCopiedMsg(null), 3500)
    }
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">History</h1>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={() => handleCopy(sessions)}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 border border-neutral-800"
          >
            Copy all
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportBackup}
          disabled={sessions.length === 0}
          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 py-2 text-xs font-medium text-neutral-300 disabled:opacity-40"
        >
          ⬇ Backup to file
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="flex-1 rounded-lg bg-neutral-900 border border-neutral-800 py-2 text-xs font-medium text-neutral-300"
        >
          ⬆ Restore from file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selected.size > 0 && (
        <button
          type="button"
          onClick={() => handleCopy(selectedSessions)}
          className="mt-3 w-full rounded-lg bg-purple-500 py-2.5 text-sm font-medium text-white"
        >
          Copy {selected.size} selected to clipboard
        </button>
      )}

      {copiedMsg && (
        <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-center text-xs text-green-400">
          {copiedMsg}
        </p>
      )}

      <div className="mt-4 space-y-2.5">
        {sessions.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">
            No sessions logged yet. Start one from the Log tab.
          </p>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggleSelected(s.id)}
                className="h-4 w-4 accent-purple-500"
              />
              <button
                type="button"
                onClick={() => toggleExpanded(s.id)}
                className="flex-1 text-left"
              >
                <p className="text-sm font-medium text-neutral-100">
                  {s.splitDay} <span className="text-neutral-500">— {s.date}</span>
                </p>
                <p className="text-xs text-neutral-500">
                  {s.exercises.filter((e) => !e.skipped).length} exercises
                  {s.exercises.some((e) => e.skipped) &&
                    ` · ${s.exercises.filter((e) => e.skipped).length} skipped`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="rounded-lg px-2 py-1 text-xs text-neutral-600 active:bg-neutral-800"
              >
                🗑
              </button>
            </div>
            {expanded.has(s.id) && (
              <pre className="mt-2.5 whitespace-pre-wrap rounded-lg bg-neutral-950 p-2.5 text-xs text-neutral-400">
                {formatSessionAsText(s)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
