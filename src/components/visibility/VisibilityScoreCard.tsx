import { useState } from 'react'
import type { VisibilityResult, VisibilityDimension } from '../../types'

interface VisibilityScoreCardProps {
  result: VisibilityResult
}

const LEVEL_COLORS: Record<VisibilityDimension['level'], string> = {
  low: 'bg-red-500',
  medium: 'bg-amber-500',
  high: 'bg-green-500',
}

const LEVEL_TEXT: Record<VisibilityDimension['level'], string> = {
  low: 'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-green-600 dark:text-green-400',
}

const LEVEL_LABEL: Record<VisibilityDimension['level'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const CONF_COLORS: Record<string, string> = {
  low: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

function DimensionRow({ dimension }: { dimension: VisibilityDimension }) {
  const [open, setOpen] = useState(false)

  return (
    <details
      open={open}
      onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="group"
    >
      <summary className="flex items-center gap-3 cursor-pointer list-none py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -mx-2 select-none">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {dimension.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-semibold uppercase tracking-wide ${LEVEL_TEXT[dimension.level]}`}>
                {LEVEL_LABEL[dimension.level]}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-8 text-right">
                {dimension.score}
              </span>
            </div>
          </div>
          {/* Score bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${LEVEL_COLORS[dimension.level]} rounded-full transition-all duration-300`}
              style={{ width: `${dimension.score}%` }}
            />
          </div>
        </div>
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M8 10.5L3 5.5h10L8 10.5z"/>
        </svg>
      </summary>

      <div className="mt-2 ml-2 pl-3 border-l-2 border-slate-100 dark:border-slate-700 pb-2">
        <ul className="space-y-1 mb-2">
          {dimension.findings.map((finding, i) => (
            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {finding}
            </li>
          ))}
        </ul>
        {dimension.recommendation && (
          <div className="mt-2 p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/40">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-semibold">Suggestion: </span>
              {dimension.recommendation}
            </p>
          </div>
        )}
      </div>
    </details>
  )
}

export function VisibilityScoreCard({ result }: VisibilityScoreCardProps) {
  const { overallScore, confidence, dimensions } = result

  const scoreColor =
    overallScore >= 70 ? 'text-green-600 dark:text-green-400'
    : overallScore >= 40 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const scoreLabel =
    overallScore >= 70 ? 'High Visibility'
    : overallScore >= 40 ? 'Moderate Visibility'
    : 'Low Visibility'

  return (
    <div className="flex flex-col gap-4">
      {/* Overall score row */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <span className={`text-4xl font-bold leading-none ${scoreColor}`}>
            {overallScore}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">/ 100</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-sm font-semibold ${scoreColor}`}>{scoreLabel}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${CONF_COLORS[confidence]}`}>
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-800" aria-hidden="true"/>

      {/* Dimension rows */}
      <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {dimensions.map(dimension => (
          <DimensionRow key={dimension.id} dimension={dimension}/>
        ))}
      </div>
    </div>
  )
}
