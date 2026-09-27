import type { FullStatistics } from '../analysis/statistics'

interface StatsBarProps {
  stats: FullStatistics
}

export function StatsBar({ stats }: StatsBarProps) {
  const diversityPct = Math.round(stats.vocabularyDiversity * 100)

  const items = [
    { label: 'Words',      value: stats.words.toLocaleString() },
    { label: 'Characters', value: stats.characters.toLocaleString() },
    { label: 'Sentences',  value: stats.sentences.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    { label: 'Avg sentence', value: `${stats.avgSentenceLength}w` },
    { label: 'Vocabulary',   value: `${diversityPct}%` },
  ]

  return (
    <div
      aria-label="Content statistics"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3"
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-2 gap-y-3">
        {items.map(({ label, value }, i) => (
          <div key={label} className={`flex flex-col items-center gap-0.5 ${i > 0 ? 'border-l border-slate-100 dark:border-slate-800' : ''}`}>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums leading-tight">
              {value}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-600">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Repeated phrases */}
      {stats.repeatedPhrases.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {stats.repeatedPhrases.slice(0, 6).map(({ phrase, count }) => (
              <span
                key={phrase}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-700 dark:text-amber-400"
              >
                &ldquo;{phrase}&rdquo;
                <span className="font-semibold">&times;{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
