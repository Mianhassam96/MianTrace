interface AnalyzeButtonProps {
  onClick: () => void
  loading: boolean
  disabled: boolean
  label?: string
}

export function AnalyzeButton({ onClick, loading, disabled, label = 'Analyze Content' }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-2.5 rounded-xl
        text-sm font-semibold
        transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950
        ${disabled || loading
          ? 'bg-blue-300 dark:bg-blue-900/50 text-white dark:text-blue-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md'
        }
      `}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5"/>
            <path className="opacity-75" fill="currentColor" d="M10 2a8 8 0 018 8h-2.5A5.5 5.5 0 0010 4.5V2z"/>
          </svg>
          Analyzing…
        </>
      ) : (
        <>
          {label}
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </>
      )}
    </button>
  )
}
