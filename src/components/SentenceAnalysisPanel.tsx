import { useState } from 'react'
import type { SentenceAnalysis, SignalLevel } from '../types'

interface SentenceAnalysisPanelProps {
  sentences: SentenceAnalysis[]
}

// ─── Styles per level ─────────────────────────────────────────────────────────

const HIGHLIGHT: Record<SignalLevel, string> = {
  high:   'bg-red-50 dark:bg-red-950/30 border-l-2 border-red-400 dark:border-red-500',
  medium: 'bg-amber-50 dark:bg-amber-950/30 border-l-2 border-amber-400 dark:border-amber-500',
  low:    'bg-transparent border-l-2 border-transparent',
}

const DOT: Record<SignalLevel, string> = {
  high:   'bg-red-400 dark:bg-red-500',
  medium: 'bg-amber-400 dark:bg-amber-400',
  low:    'bg-gray-200 dark:bg-gray-700',
}

const BADGE: Record<SignalLevel, string> = {
  high:   'text-red-600 dark:text-red-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low:    'text-gray-400 dark:text-gray-600',
}

const LABEL: Record<SignalLevel, string> = {
  high:   'High signal',
  medium: 'Moderate signal',
  low:    'Low signal',
}

// ─── Single sentence row ──────────────────────────────────────────────────────

function SentenceRow({ sentence }: { sentence: SentenceAnalysis }) {
  const [open, setOpen] = useState(false)
  const hasContributions = sentence.contributions.length > 0

  return (
    <div className={`rounded-lg px-4 py-3 transition-colors ${HIGHLIGHT[sentence.level]}`}>
      {/* Main row */}
      <div className="flex items-start gap-3">
        {/* Index + dot */}
        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
          <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-600 leading-none">
            {sentence.index + 1}
          </span>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[sentence.level]}`} aria-hidden="true" />
        </div>

        {/* Sentence text */}
        <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {sentence.text}
        </p>

        {/* Level label + expand toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`text-xs font-medium ${BADGE[sentence.level]}`}>
            {LABEL[sentence.level]}
          </span>
          {hasContributions && (
            <button
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-label={open ? 'Hide details' : 'Show details'}
              className="p-0.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg
                viewBox="0 0 14 14"
                fill="currentColor"
                className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              >
                <path d="M2 4.5l5 5 5-5H2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Expanded contributions */}
      {open && hasContributions && (
        <div className="mt-3 ml-8 flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600">
            Why this sentence contributed
          </p>
          <ul className="flex flex-col gap-1.5" role="list">
            {sentence.contributions.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600 flex-shrink-0 mt-1.5" aria-hidden="true" />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {c.reason}
                </span>
              </li>
            ))}
          </ul>
          {/* Always clarify what this means */}
          <p className="text-[11px] text-gray-400 dark:text-gray-600 italic mt-1">
            This sentence shows patterns that contributed to the AI-likelihood estimate — not proof of AI authorship.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function SentenceAnalysisPanel({ sentences }: SentenceAnalysisPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  const highCount   = sentences.filter(s => s.level === 'high').length
  const mediumCount = sentences.filter(s => s.level === 'medium').length
  const total       = sentences.length

  if (total === 0) return null

  return (
    <div>
      {/* Panel header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Sentence-Level Analysis
        </h2>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {highCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
                {highCount} high
              </span>
            )}
            {mediumCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                {mediumCount} medium
              </span>
            )}
            <span className="text-gray-400 dark:text-gray-600">{total} total</span>
          </div>
          <svg
            viewBox="0 0 14 14"
            fill="currentColor"
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            aria-hidden="true"
          >
            <path d="M2 4.5l5 5 5-5H2z" />
          </svg>
        </div>
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2">
          {sentences.map(sentence => (
            <SentenceRow key={sentence.index} sentence={sentence} />
          ))}

          {/* Footer note */}
          <p className="text-[11px] text-gray-400 dark:text-gray-600 text-center pt-2 leading-relaxed">
            Color indicates how much each sentence contributed to the AI-likelihood estimate.
            Click any sentence with a signal to see why.
          </p>
        </div>
      )}
    </div>
  )
}
