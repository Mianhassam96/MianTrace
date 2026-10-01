import type { AnalysisResult } from '../types'

interface ScoreCardProps {
  result: AnalysisResult
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high:     'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50',
  moderate: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  low:      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-red-600 dark:text-red-400'
  if (score >= 45) return 'text-amber-500 dark:text-amber-400'
  return 'text-green-600 dark:text-green-400'
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return '#dc2626'
  if (score >= 45) return '#d97706'
  return '#16a34a'
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'High AI-Likelihood'
  if (score >= 45) return 'Moderate AI-Likelihood'
  if (score >= 25) return 'Low-Moderate AI-Likelihood'
  return 'Low AI-Likelihood'
}

function ScoreRing({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const color = getScoreRingColor(score)

  return (
    /* aria-hidden: accessible label is on the parent card via aria-label */
    <div className="relative inline-flex items-center justify-center w-32 h-32" aria-hidden="true">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="7"
          className="text-slate-100 dark:text-slate-800"/>
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold tabular-nums ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
    </div>
  )
}

export function ScoreCard({ result }: ScoreCardProps) {
  const { aiLikelihood, confidence, statistics } = result

  const stats = [
    { label: 'Words',         value: statistics.words.toLocaleString() },
    { label: 'Sentences',     value: statistics.sentences.toLocaleString() },
    { label: 'Paragraphs',    value: statistics.paragraphs.toLocaleString() },
    { label: 'Characters',    value: statistics.characters.toLocaleString() },
  ]

  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
      aria-label={`AI-likelihood estimate: ${aiLikelihood} percent. ${getScoreLabel(aiLikelihood)}. ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence.`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-4">
        AI-Likelihood Estimate
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ring + labels */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <ScoreRing score={aiLikelihood} />
          <p className={`text-sm font-semibold ${getScoreColor(aiLikelihood)}`}>
            {getScoreLabel(aiLikelihood)}
          </p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${CONFIDENCE_STYLES[confidence]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" aria-hidden="true"/>
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-28 bg-slate-100 dark:bg-slate-800 flex-shrink-0" aria-hidden="true"/>

        {/* Stats */}
        <div className="flex-1 w-full">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-3">
            Content Overview
          </p>
          <div className="grid grid-cols-2 gap-2">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
                <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums leading-tight">{value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
