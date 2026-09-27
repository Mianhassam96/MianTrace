import type { Signal } from '../types'
import { SignalCard } from './SignalCard'

interface SignalsPanelProps {
  signals: Signal[]
}

export function SignalsPanel({ signals }: SignalsPanelProps) {
  const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = [...signals].sort((a, b) => (order[a.level] ?? 3) - (order[b.level] ?? 3))
  const highCount   = signals.filter(s => s.level === 'high').length
  const mediumCount = signals.filter(s => s.level === 'medium').length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Writing Signals
        </h2>
        <div className="flex items-center gap-2 text-xs">
          {highCount > 0 && <span className="text-red-500 font-medium">{highCount} high</span>}
          {mediumCount > 0 && <span className="text-amber-500 font-medium">{mediumCount} medium</span>}
          <span className="text-slate-400 dark:text-slate-600">click to expand</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {sorted.map(signal => <SignalCard key={signal.id} signal={signal}/>)}
      </div>
    </div>
  )
}
