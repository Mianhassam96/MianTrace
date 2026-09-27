import type { AnalysisResult } from '../types'
import { ScoreCard } from './ScoreCard'
import { SignalsPanel } from './SignalsPanel'
import { ExplanationPanel } from './ExplanationPanel'
import { SentenceAnalysisPanel } from './SentenceAnalysisPanel'
import { ImprovementsPanel } from './ImprovementsPanel'
import { WebsiteResultsHeader } from './WebsiteResultsHeader'
import type { WorkerSuccessResponse } from '../api/worker-client'

interface ResultsPanelProps {
  result: AnalysisResult
  onReset: () => void
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Divider with label */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wide">
          Results
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Website metadata header — shown only for website analysis */}
      {result.sourceMode === 'website' && result.websiteData && (
        <WebsiteResultsHeader websiteData={result.websiteData as WorkerSuccessResponse} />
      )}

      {/* Score card */}
      <ScoreCard result={result} />

      {/* Explanation */}
      <ExplanationPanel
        explanation={result.explanation}
        limitations={result.limitations}
      />

      {/* Signal breakdown */}
      <SignalsPanel signals={result.signals} />

      {/* Sentence-level analysis */}
      {result.sentenceAnalyses.length > 0 && (
        <SentenceAnalysisPanel sentences={result.sentenceAnalyses} />
      )}

      {/* Improvement suggestions */}
      <ImprovementsPanel signals={result.signals} />

      {/* New analysis button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M2 8a6 6 0 1112 0H12a4 4 0 10-8 0H2zm5-4V2H5v2H3.5L6 7l2.5-3H7z" />
          </svg>
          Analyze new content
        </button>
      </div>
    </div>
  )
}
