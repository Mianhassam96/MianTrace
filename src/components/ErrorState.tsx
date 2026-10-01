interface ErrorStateProps {
  headline: string
  detail: string
  retryable?: boolean
  onRetry?: () => void
}

export function ErrorState({ headline, detail, retryable = true, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-4"
    >
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 18 18" fill="currentColor" className="w-[18px] h-[18px] text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true">
          <path d="M9 1L1 15h16L9 1zm0 2.7L15.4 14H2.6L9 3.7zM8.2 7v3.5h1.6V7H8.2zm0 4.5V13h1.6v-1.5H8.2z"/>
        </svg>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            {headline}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 leading-relaxed">
            {detail}
          </p>
        </div>

        {retryable && onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
