import type { AnalysisResult } from '../types'

interface ScoreCardProps {
  result: AnalysisResult
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high:     'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50',
  moderate: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  low:      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
}

function getLikelihoodColor(score: number): string {
  if (score >= 70) return 'text-red-600 dark:text-red-400'
  if (score >= 45) return 'text-amber-500 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

function getLikelihoodLabel(score: number): string {
  if (score >= 70) return 'High AI-Likelihood'
  if (score >= 45) return 'Moderate AI-Likelihood'
  if (score >= 25) return 'Low-Moderate AI-Likelihood'
  return 'Low AI-Likelihood'
}

function getLikelihoodRingColor(score: number): string {
  if (score >= 70) return '#ef4444'
  if (score >= 45) return '#f59e0b'
  return '#22c55e'
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const color = getLikelihoodRingColor(score)

  return (
    <div className="relative inline-flex items-center justify-center w-36 h-36" aria-hidden="true">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-100 dark:text-gray-800"
        />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${getLikelihoodColor(score)}`}>
          {score}%
        </span>
      </div>
    </div>
  )
}

export function ScoreCard({ result }: ScoreCardProps) {
  const { aiLikelihood, confidence, statistics } = result

  const stats = [
    { label: 'Words',      value: statistics.words.toLocaleString() },
    { label: 'Sentences',  value: statistics.sentences.toLocaleString() },
    { label: 'Paragraphs', value: statistics.paragraphs.toLocaleString() },
    { label: 'Avg. sentence', value: `${statistics.avgSentenceLength}w` },
  ]

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ring + label */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <ScoreRing score={aiLikelihood} />
          <p className={`text-sm font-semibold ${getLikelihoodColor(aiLikelihood)}`}>
            {getLikelihoodLabel(aiLikelihood)}
          </p>
          {/* Confidence badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${CONFIDENCE_STYLES[confidence]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
          </span>
        </div>

        {/* Stats grid */}
        <div className="flex-1 w-full">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600 mb-3">
            Content Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5"
              >
                <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums leading-tight">
                  {value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
