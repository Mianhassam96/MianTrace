import { useState } from 'react'
import type { Signal, SignalLevel } from '../types'

interface SignalCardProps {
  signal: Signal
}

const LEVEL: Record<SignalLevel, { badge: string; bar: string; label: string }> = {
  high:   { badge: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50', bar: 'bg-red-500', label: 'HIGH' },
  medium: { badge: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50', bar: 'bg-amber-400', label: 'MEDIUM' },
  low:    { badge: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', bar: 'bg-slate-300 dark:bg-slate-600', label: 'LOW' },
}

export function SignalCard({ signal }: SignalCardProps) {
  const [open, setOpen] = useState(false)
  const s = LEVEL[signal.level]
  const pct = Math.round(signal.score * 100)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{signal.name}</span>

        {/* Score bar */}
        <div className="hidden sm:flex items-center gap-2 w-20">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full ${s.bar} transition-all duration-500`} style={{ width: `${pct}%` }}/>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${s.badge} flex-shrink-0 tracking-wide`}>
          {s.label}
        </span>
        <svg viewBox="0 0 14 14" fill="currentColor"
          className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true">
          <path d="M2 4.5l5 5 5-5H2z"/>
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{signal.description}</p>

          {signal.suggestion && (
            <div className="flex gap-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-3 py-2.5">
              <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M7 1a4.5 4.5 0 00-1.5 8.74V11h3V9.74A4.5 4.5 0 007 1zM5.5 12v1h3v-1h-3z"/>
              </svg>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                <span className="font-semibold">Suggestion: </span>{signal.suggestion}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
