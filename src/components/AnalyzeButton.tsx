interface AnalyzeButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

export function AnalyzeButton({ onClick, loading, disabled }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        w-full sm:w-auto sm:min-w-48
        flex items-center justify-center gap-2.5
        px-8 py-3 rounded-xl
        text-sm font-semibold
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950
        ${disabled || loading
          ? 'bg-indigo-300 dark:bg-indigo-900 text-white dark:text-indigo-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm hover:shadow-md'
        }
      `}
    >
      {loading ? (
        <>
          {/* Spinner */}
          <svg
            className="w-4 h-4 animate-spin"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="10" cy="10" r="8"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M10 2a8 8 0 018 8h-2.5A5.5 5.5 0 0010 4.5V2z"
            />
          </svg>
          Analyzing…
        </>
      ) : (
        <>
          {/* Analyze icon */}
          <svg viewBox="0 0 18 18" fill="none" className="w-4 h-4" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Analyze Content
        </>
      )}
    </button>
  )
}
