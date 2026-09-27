interface ExplanationPanelProps {
  explanation: string
  limitations: string
}

export function ExplanationPanel({ explanation, limitations }: ExplanationPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-2">
          Why this result?
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Limitations */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        <svg viewBox="0 0 18 18" fill="currentColor" className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true">
          <path d="M9 1a8 8 0 100 16A8 8 0 009 1zm.75 11.5h-1.5v-5h1.5v5zm0-6.5h-1.5V4.5h1.5V6z"/>
        </svg>
        <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
          {limitations}
        </p>
      </div>
    </div>
  )
}
