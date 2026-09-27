interface ExplanationPanelProps {
  explanation: string
  limitations: string
}

export function ExplanationPanel({ explanation, limitations }: ExplanationPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Explanation */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-600 mb-2">
          Analysis Summary
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {explanation}
        </p>
      </div>

      {/* Limitations disclaimer */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 px-5 py-4 flex gap-3">
        <svg
          viewBox="0 0 18 18"
          fill="currentColor"
          className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        >
          <path d="M9 1L1 15h16L9 1zm0 2.8L15.3 14H2.7L9 3.8zM8.1 7.5v3h1.8v-3H8.1zm0 4v1.5h1.8v-1.5H8.1z" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            Important Limitation
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed opacity-90">
            {limitations}
          </p>
        </div>
      </div>
    </div>
  )
}
