import type { WorkerSuccessResponse } from '../api/worker-client'

interface WebsiteResultsHeaderProps {
  websiteData: WorkerSuccessResponse
}

export function WebsiteResultsHeader({ websiteData }: WebsiteResultsHeaderProps) {
  const hostname = (() => {
    try { return new URL(websiteData.url).hostname } catch { return websiteData.url }
  })()

  const stats = [
    { label: 'Words extracted', value: websiteData.wordCount.toLocaleString() },
    { label: 'Paragraphs',       value: websiteData.paragraphCount.toLocaleString() },
    { label: 'Headings',         value: websiteData.headings.length.toLocaleString() },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3">
      {/* URL */}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400">
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zM2 6a4 4 0 01.6-2.1C3.1 4.9 4 5.3 5 5.35V7c-1.3.05-2.3.55-2.75 1.3A4 4 0 012 6zm1.5 2.45C4 7.95 4.9 7.5 6 7.5v1A4 4 0 013.5 8.45zM6 9.5V8.5c.95 0 1.85-.45 2.25-.95V8.5a4 4 0 01-2.25 1zm0-5v-2a4 4 0 012.5 1.1C8.1 3.9 7.15 4.45 6 4.5zm0-2a4 4 0 013.35 1.85A3.8 3.8 0 018 4.5V3.15A4 4 0 006 2.5zm2.5 5.95V7.1c.9-.35 1.8-.85 2.1-1.5.2.4.33.84.38 1.3C9.8 7.5 9.1 8.1 8.5 8.45zM8.5 6V4.85a4 4 0 011.45 2.5C9.45 6.8 9 6.3 8.5 6z"/>
          </svg>
        </div>
        <a
          href={websiteData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
          aria-label={`Open ${websiteData.url} in new tab`}
        >
          {hostname}
        </a>
      </div>

      {/* Title */}
      {websiteData.title && (
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
          {websiteData.title}
        </h3>
      )}

      {/* Description */}
      {websiteData.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {websiteData.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">{value}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Headings */}
      {websiteData.headings.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-600">
            Page headings
          </p>
          <div className="flex flex-wrap gap-1.5">
            {websiteData.headings.slice(0, 5).map((h, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[200px]"
                title={h}
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
