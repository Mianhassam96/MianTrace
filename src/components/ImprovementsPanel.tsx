import { useState } from 'react'
import type { Signal } from '../types'
import { getImprovements } from '../analysis/improvements'
import type { ImprovementAdvice } from '../analysis/improvements'

interface ImprovementsPanelProps {
  signals: Signal[]
}

function ImprovementCard({ advice }: { advice: ImprovementAdvice }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" aria-hidden="true">
            <path d="M7 1a4.5 4.5 0 00-1.5 8.74V11h3V9.74A4.5 4.5 0 007 1zM5.5 12v1h3v-1h-3z"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {advice.headline}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {advice.signalName}
          </p>
        </div>

        <svg viewBox="0 0 14 14" fill="currentColor"
          className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true">
          <path d="M2 4.5l5 5 5-5H2z"/>
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {advice.context}
          </p>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-600 mb-2">
              What to do
            </p>
            <ul className="flex flex-col gap-1.5" role="list">
              {advice.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {advice.example && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-600">
                Example
              </p>
              <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500 dark:text-red-400 mb-1">Before</p>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed italic">
                  &ldquo;{advice.example.before}&rdquo;
                </p>
              </div>
              <div className="rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/20 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-1">After</p>
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed italic">
                  &ldquo;{advice.example.after}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ImprovementsPanel({ signals }: ImprovementsPanelProps) {
  const improvements = getImprovements(signals)
  if (improvements.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Improvement Suggestions
        </h2>
        <span className="text-xs text-slate-400 dark:text-slate-600">
          {improvements.length} suggestion{improvements.length !== 1 ? 's' : ''} · click to expand
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {improvements.map(advice => (
          <ImprovementCard key={advice.signalId} advice={advice}/>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-600 text-center mt-3 leading-relaxed">
        Suggestions are based on detected writing patterns — apply judgement to what fits your context.
      </p>
    </div>
  )
}
