interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5 text-red-500 dark:text-red-400">
        <svg viewBox="0 0 18 18" fill="currentColor" className="w-4.5 h-4.5 w-[18px] h-[18px]" aria-hidden="true">
          <path d="M9 1L1 15h16L9 1zm0 2.7L15.4 14H2.6L9 3.7zM8.2 7v3.5h1.6V7H8.2zm0 4.5V13h1.6v-1.5H8.2z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          Something went wrong
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline underline-offset-2 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
