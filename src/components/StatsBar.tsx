import type { FullStatistics } from '../analysis/statistics'

interface StatsBarProps {
  stats: FullStatistics
}

interface StatItemProps {
  label: string
  value: string | number
  sub?: string
}

function StatItem({ label, value, sub }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3 first:pl-0 last:pr-0">
      <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      {sub && (
        <span className="text-[11px] text-gray-400 dark:text-gray-600">{sub}</span>
      )}
    </div>
  )
}

export function StatsBar({ stats }: StatsBarProps) {
  const diversityPct = Math.round(stats.vocabularyDiversity * 100)

  return (
    <div
      aria-label="Content statistics"
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-4 py-2"
    >
      {/* Grid layout — wraps gracefully on narrow screens */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
        <StatItem label="words" value={stats.words} />
        <StatItem label="characters" value={stats.characters} />
        <StatItem label="sentences" value={stats.sentences} />
        <StatItem label="paragraphs" value={stats.paragraphs} />
        <StatItem
          label="avg sentence"
          value={`${stats.avgSentenceLength}w`}
          sub={`${stats.minSentenceLength}–${stats.maxSentenceLength}w`}
        />
        <StatItem
          label="vocabulary"
          value={`${diversityPct}%`}
          sub="unique"
        />
      </div>

      {/* Repeated phrases — only shown if any found */}
      {stats.repeatedPhrases.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wide mb-1.5">
            Repeated phrases
          </p>
          <div className="flex flex-wrap gap-1.5">
            {stats.repeatedPhrases.slice(0, 8).map(({ phrase, count }) => (
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
