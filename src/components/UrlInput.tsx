interface UrlInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  const hasValue = value.trim().length > 0
  const isValid = hasValue && isValidUrl(value.trim())
  const isInvalid = hasValue && !isValid

  return (
    <div className="flex flex-col gap-2" id="panel-website" role="tabpanel" aria-label="Website URL input">
      <div className="relative flex items-center">
        {/* Globe icon */}
        <div className="absolute left-3.5 text-gray-400 dark:text-gray-600 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 18 18" fill="currentColor" className="w-4 h-4">
            <path d="M9 1a8 8 0 100 16A8 8 0 009 1zM2.5 9a6.48 6.48 0 01.9-3.27C4.1 7.2 5.7 8 7.5 8.08V10c-2.1.08-3.76.9-4.4 2.18A6.47 6.47 0 012.5 9zm1.65 3.7C4.76 11.56 6.03 11 7.5 11v1.5A6.5 6.5 0 014.15 12.7zM7.5 14.5v-1.5c1.47 0 2.74-.56 3.35-1.3V13a6.5 6.5 0 01-3.35 1.5zm0-7.42C5.67 7 4.3 6.18 3.85 4.96A6.5 6.5 0 017.5 3.5v3.58zM8.5 3.56A6.5 6.5 0 0113 8h-1.5C11.4 6.24 10.18 4.68 8.5 3.56zm0 10.88c1.68-1.12 2.9-2.68 3-4.44H13a6.5 6.5 0 01-4.5 4.44zM8.5 10V8.08C10.3 8 11.9 7.2 12.6 5.73A6.48 6.48 0 0115.5 9c0 .43-.04.85-.13 1.25C14.7 9.4 12.63 9 8.5 10z" />
          </svg>
        </div>

        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="https://example.com/article"
          aria-label="Website URL to analyze"
          aria-invalid={isInvalid}
          className={`
            w-full rounded-xl border pl-10 pr-4 py-3.5
            text-sm text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-600
            bg-white dark:bg-gray-900
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${isInvalid
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-200 dark:border-gray-700'
            }
          `}
        />

        {/* Valid indicator */}
        {isValid && (
          <div className="absolute right-3.5 text-green-500" aria-label="Valid URL">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.03 5.03l-3.5 3.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97 2.97-2.97a.75.75 0 011.06 1.06z" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="text-xs px-0.5">
        {isInvalid && (
          <span className="text-red-500 dark:text-red-400">
            Enter a valid HTTPS URL — e.g. https://example.com/article
          </span>
        )}
        {!hasValue && (
          <span className="text-gray-400 dark:text-gray-600">
            HTTPS URLs only. The page content will be fetched and analyzed.
          </span>
        )}
        {isValid && (
          <span className="text-gray-400 dark:text-gray-600">
            MianTrace will fetch and extract the main content from this page.
          </span>
        )}
      </div>
    </div>
  )
}
