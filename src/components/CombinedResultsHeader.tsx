/**
 * CombinedResultsHeader
 * Shows both engine scores side by side at the top of the results section.
 * Phase 3+4 — combined analysis dashboard header.
 */

import type { CombinedResult } from '../types'

interface CombinedResultsHeaderProps {
  result: CombinedResult
}

function ScorePill({
  label,
  score,
  sublabel,
  color,
}: {
  label: string
  score: number
  sublabel: string
  color: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-4 px-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {label}
      </p>
      <span className={`text-4xl font-bold tabular-nums leading-none ${color}`}>
        {score}<span className="text-xl font-semibold">%</span>
      </span>
      <p className={`text-xs font-medium ${color}`}>{sublabel}</p>
    </div>
  )
}

export function CombinedResultsHeader({ result }: CombinedResultsHeaderProps) {
  const { writing, visibility } = result

  const writingColor =
    writing.aiLikelihood >= 70 ? 'text-red-600 dark:text-red-400'
    : writing.aiLikelihood >= 45 ? 'text-amber-500 dark:text-amber-400'
    : 'text-green-600 dark:text-green-400'

  const writingLabel =
    writing.aiLikelihood >= 70 ? 'High AI-Likelihood'
    : writing.aiLikelihood >= 45 ? 'Moderate'
    : writing.aiLikelihood >= 25 ? 'Low-Moderate'
    : 'Low AI-Likelihood'

  const visColor =
    visibility.overallScore >= 70 ? 'text-green-600 dark:text-green-400'
    : visibility.overallScore >= 40 ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const visLabel =
    visibility.overallScore >= 70 ? 'High Readiness'
    : visibility.overallScore >= 40 ? 'Moderate'
    : 'Low Readiness'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Analysis complete · {new Date(result.analyzedAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
        {result.sourceMode === 'website' && result.websiteData && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 truncate">
            {result.websiteData.url}
          </p>
        )}
      </div>

      {/* Two score pills */}
      <div className="flex divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
        <ScorePill
          label="AI Writing"
          score={writing.aiLikelihood}
          sublabel={writingLabel}
          color={writingColor}
        />
        <ScorePill
          label="Visibility Readiness"
          score={visibility.overallScore}
          sublabel={visLabel}
          color={visColor}
        />
      </div>

      {/* Confidence row */}
      <div className="flex divide-x divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex-1 flex items-center justify-center py-2 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true"/>
          <span className="text-xs text-slate-400 dark:text-slate-600">
            {writing.confidence.charAt(0).toUpperCase() + writing.confidence.slice(1)} confidence
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center py-2 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true"/>
          <span className="text-xs text-slate-400 dark:text-slate-600">
            {visibility.confidence.charAt(0).toUpperCase() + visibility.confidence.slice(1)} confidence
          </span>
        </div>
      </div>
    </div>
  )
}
