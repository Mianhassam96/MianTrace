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
      {/* Website header */}
      {result.sourceMode === 'website' && result.websiteData && (
        <WebsiteResultsHeader websiteData={result.websiteData as WorkerSuccessResponse}/>
      )}

      {/* Score */}
      <ScoreCard result={result}/>

      {/* Explanation + limitations */}
      <ExplanationPanel explanation={result.explanation} limitations={result.limitations}/>

      {/* Signals */}
      <SignalsPanel signals={result.signals}/>

      {/* Sentence analysis */}
      {result.sentenceAnalyses.length > 0 && (
        <SentenceAnalysisPanel sentences={result.sentenceAnalyses}/>
      )}

      {/* Improvements */}
      <ImprovementsPanel signals={result.signals}/>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-2" aria-hidden="true">
        <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"/>
      </div>

      {/* Reset */}
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M2 8a6 6 0 1112 0H12a4 4 0 10-8 0H2zm5-4V2H5v2H3.5L6 7l2.5-3H7z"/>
          </svg>
          Analyze new content
        </button>
      </div>
    </div>
  )
}
