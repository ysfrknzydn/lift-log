import { lazy, Suspense, useState } from 'react'
import LogTab from './components/LogTab'
import HistoryTab from './components/HistoryTab'

const ProgressTab = lazy(() => import('./components/ProgressTab'))

type Tab = 'log' | 'history' | 'progress'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'log', label: 'Log', icon: '🏋' },
  { id: 'history', label: 'History', icon: '📅' },
  { id: 'progress', label: 'Progress', icon: '📈' },
]

function App() {
  const [tab, setTab] = useState<Tab>('log')

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-950">
      <main className="flex-1 overflow-y-auto pb-24">
        {tab === 'log' && <LogTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'progress' && (
          <Suspense fallback={<p className="px-4 pt-6 text-sm text-neutral-500">Loading…</p>}>
            <ProgressTab />
          </Suspense>
        )}
      </main>

      <nav
        className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              tab === t.id ? 'text-purple-400' : 'text-neutral-500'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
