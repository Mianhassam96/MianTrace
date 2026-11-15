import type { VisibilityResult } from '../../types'
import { VisibilityScoreCard } from './VisibilityScoreCard'

interface VisibilityResultsPanelProps {
  result: VisibilityResult
}

export function VisibilityResultsPanel({ result }: VisibilityResultsPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
      {/* Section heading */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1">
          AI Visibility
        </p>
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          AI Visibility Readiness
        </h2>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800 -mx-1" aria-hidden="true"/>

      {/* Explanation */}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {result.explanation}
      </p>

      {/* Score card */}
      <VisibilityScoreCard result={result}/>

      {/* Limitations note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
        {result.limitations}
      </p>
    </div>
  )
}
