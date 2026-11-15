/**
 * ImprovementLab
 * Phase 5 — Content Improvement Lab.
 * Editable workspace: paste original text, see scores, edit,
 * re-analyze and compare before/after results.
 */

import { useState, useCallback, useMemo } from 'react'
import { computeStatistics, runSignalEngine } from '../analysis'
import { runVisibilityEngine } from '../analysis/visibility/visibilityEngine'
import type { CombinedResult } from '../types'

// ─── Mini score badge ─────────────────────────────────────────────────────────

function ScoreBadge({
  label,
  score,
  prev,
}: {
  label: string
  score: number
  prev?: number
}) {
  const delta = prev !== undefined ? score - prev : null
  const color =
    score >= 70 ? 'text-green-600 dark:text-green-400'
    : score >= 40 ? 'text-amber-500 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-semibold">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{score}%</span>
        {delta !== null && delta !== 0 && (
          <span className={`text-xs font-semibold ${delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Single panel: editor + scores ───────────────────────────────────────────

function EditorPanel({
  label,
  value,
  onChange,
  result,
  prevResult,
  readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  result: CombinedResult | null
  prevResult?: CombinedResult | null
  readOnly?: boolean
}) {
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length
  const charCount = value.length

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span className="text-xs text-slate-400 dark:text-slate-600 tabular-nums">
          {wordCount.toLocaleString()} words
        </span>
      </div>

      {/* Scores row */}
      {result && (
        <div className="flex items-center justify-around bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
          <ScoreBadge
            label="AI Writing"
            score={result.writing.aiLikelihood}
            prev={prevResult?.writing.aiLikelihood}
          />
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" aria-hidden="true"/>
          <ScoreBadge
            label="Visibility"
            score={result.visibility.overallScore}
            prev={prevResult?.visibility.overallScore}
          />
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        readOnly={readOnly}
        rows={16}
        placeholder={readOnly ? '' : 'Paste your content here to begin…'}
        aria-label={`${label} content`}
        className={`
          w-full resize-none rounded-xl border text-sm leading-relaxed px-4 py-3.5
          text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-600
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-150
          ${readOnly
            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700 cursor-default'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
          }
        `}
      />

      {/* Char counter */}
      <p className="text-xs text-slate-400 dark:text-slate-600 text-right tabular-nums">
        {charCount.toLocaleString()} / 10,000 characters
      </p>
    </div>
  )
}

// ─── Improvement Lab ─────────────────────────────────────────────────────────

function runAnalysis(text: string): CombinedResult | null {
  if (text.trim().length < 20) return null
  const stats = computeStatistics(text)
  return {
    writing: { ...runSignalEngine(stats), sourceMode: 'text' },
    visibility: runVisibilityEngine(stats, text),
    sourceMode: 'text',
    analyzedAt: new Date().toISOString(),
  }
}

export function ImprovementLab() {
  const [original, setOriginal] = useState('')
  const [edited, setEdited] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  const MAX_CHARS = 10000

  function handleOriginalChange(v: string) {
    setOriginal(v.slice(0, MAX_CHARS))
    if (!hasStarted && v.trim().length > 20) {
      setEdited(v.slice(0, MAX_CHARS))
      setHasStarted(true)
    }
  }

  function handleEditedChange(v: string) {
    setEdited(v.slice(0, MAX_CHARS))
  }

  function handleLoadOriginal() {
    setEdited(original)
  }

  // Debounce-free: re-analyze on every change (engine is fast, <5ms)
  const originalResult = useMemo(() => runAnalysis(original), [original])
  const editedResult = useMemo(() => runAnalysis(edited), [edited])

  const showComparison = originalResult !== null && editedResult !== null
  const hasChanged = original !== edited

  const writingDelta = showComparison
    ? editedResult!.writing.aiLikelihood - originalResult!.writing.aiLikelihood
    : null
  const visDelta = showComparison
    ? editedResult!.visibility.overallScore - originalResult!.visibility.overallScore
    : null

  return (
    <article className="max-w-5xl mx-auto px-5 py-10 sm:py-14">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Improvement Lab
        </p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
          Edit. Re-analyze. Compare.
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
          Paste your content on the left, then edit the right panel. Both scores update live as you type.
        </p>
      </header>

      {/* Delta summary banner — shown when both sides have content and differ */}
      {showComparison && hasChanged && (
        <div className="mb-6 p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1">
            Score change from your edits:
          </p>
          <div className="flex items-center gap-6">
            {writingDelta !== null && (
              <div className="flex flex-col items-center">
                <span className={`text-lg font-bold ${writingDelta < 0 ? 'text-green-600 dark:text-green-400' : writingDelta > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                  {writingDelta > 0 ? '+' : ''}{writingDelta}pp
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-600">AI Writing</span>
              </div>
            )}
            {visDelta !== null && (
              <div className="flex flex-col items-center">
                <span className={`text-lg font-bold ${visDelta > 0 ? 'text-green-600 dark:text-green-400' : visDelta < 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {visDelta > 0 ? '+' : ''}{visDelta}pp
                </span>
                <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-600">Visibility</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600 w-full sm:w-auto">
            {writingDelta !== null && writingDelta < 0
              ? '↓ Lower AI-writing score = more natural writing patterns. '
              : ''}
            {visDelta !== null && visDelta > 0
              ? '↑ Higher visibility score = more AI-readable content.'
              : ''}
          </p>
        </div>
      )}

      {/* Two-panel editor */}
      <div className="flex flex-col lg:flex-row gap-5">
        <EditorPanel
          label="Original"
          value={original}
          onChange={handleOriginalChange}
          result={originalResult}
        />

        <div className="hidden lg:flex flex-col items-center justify-center gap-2 py-8">
          <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700"/>
          <button
            onClick={handleLoadOriginal}
            disabled={!original}
            title="Copy original to edited panel"
            aria-label="Reset edited content to original"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M4 4h5l3 4-3 4H4V4zm0-1a1 1 0 00-1 1v8a1 1 0 001 1h5.5l3.5-4.5L9.5 3H4z"/>
            </svg>
          </button>
          <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700"/>
        </div>

        {/* Mobile reset button */}
        <div className="lg:hidden flex justify-center">
          <button
            onClick={handleLoadOriginal}
            disabled={!original}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M2 8a6 6 0 1112 0H12a4 4 0 10-8 0H2zm5-4V2H5v2H3.5L6 7l2.5-3H7z"/>
            </svg>
            Reset edited to original
          </button>
        </div>

        <EditorPanel
          label="Edited"
          value={edited}
          onChange={handleEditedChange}
          result={editedResult}
          prevResult={originalResult}
        />
      </div>

      {/* Guidance when empty */}
      {!hasStarted && (
        <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-600">
          Paste content in the Original panel to begin. Scores update as you type.
        </div>
      )}

      {/* Limitations */}
      <p className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600 text-center leading-relaxed">
        Scores are live estimates based on writing patterns. Lowering the AI-writing score and raising the
        visibility score are both good — they are independent measures.
      </p>
    </article>
  )
}
