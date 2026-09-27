import { useState } from 'react'
import type { Signal, SignalLevel } from '../types'

interface SignalCardProps {
  signal: Signal
}

const LEVEL_STYLES: Record<SignalLevel, { badge: string; bar: string; label: string }> = {
  high: {
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
    bar: 'bg-red-500 dark:bg-red-400',
    label: 'HIGH',
  },
  medium: {
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    bar: 'bg-amber-400 dark:bg-amber-400',
    label: 'MEDIUM',
  },
  low: {
    badge: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50',
    bar: 'bg-green-500 dark:bg-green-400',
    label: 'LOW',
  },
}

export function SignalCard({ signal }: SignalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const styles = LEVEL_STYLES[signal.level]
  const scorePct = Math.round(signal.score * 100)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
      >
        {/* Signal name */}
        <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          {signal.name}
        </span>

        {/* Score bar */}
        <div className="hidden sm:flex items-center gap-2 w-24">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${styles.bar} transition-all duration-500`}
              style={{ width: `${scorePct}%` }}
              role="presentation"
            />
          </div>
        </div>

        {/* Level badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${styles.badge} flex-shrink-0`}>
          {styles.label}
        </span>

        {/* Chevron */}
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4H4z" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-3">
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {signal.description}
          </p>

          {/* Score bar (mobile) */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${styles.bar}`}
                style={{ width: `${scorePct}%` }}
                role="presentation"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">{scorePct}%</span>
          </div>

          {/* Suggestion */}
          {signal.suggestion && (
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-3 py-2.5 flex gap-2.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M8 1a5.5 5.5 0 00-2 10.6V13h4v-1.4A5.5 5.5 0 008 1zm-1 11v1h2v-1H7zm1-9.5A3.5 3.5 0 0111.5 6a3.49 3.49 0 01-2 3.15V11H6.5V9.15A3.49 3.49 0 014.5 6 3.5 3.5 0 018 2.5z" />
              </svg>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                <span className="font-semibold">Suggestion: </span>
                {signal.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
