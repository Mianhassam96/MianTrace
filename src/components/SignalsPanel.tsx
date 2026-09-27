import type { Signal } from '../types'
import { SignalCard } from './SignalCard'

interface SignalsPanelProps {
  signals: Signal[]
}

export function SignalsPanel({ signals }: SignalsPanelProps) {
  // Sort: high first, then medium, then low
  const levelOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = [...signals].sort(
    (a, b) => (levelOrder[a.level] ?? 3) - (levelOrder[b.level] ?? 3)
  )

  const highCount   = signals.filter(s => s.level === 'high').length
  const mediumCount = signals.filter(s => s.level === 'medium').length

  return (
    <div>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Signal Breakdown
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {highCount > 0 && (
            <span className="text-red-500 dark:text-red-400 font-medium">
              {highCount} high
            </span>
          )}
          {mediumCount > 0 && (
            <span className="text-amber-500 dark:text-amber-400 font-medium">
              {mediumCount} medium
            </span>
          )}
          <span className="text-gray-400 dark:text-gray-600">
            click to expand
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  )
}
