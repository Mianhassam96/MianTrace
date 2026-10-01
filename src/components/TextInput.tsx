interface TextInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const MAX_CHARS = 10000
const MIN_WORDS = 10
const WARN_WORDS = 50
const PASTE_WARN_CHARS = 8000

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  const charCount = value.length
  const wordCount = countWords(value)
  const hasContent = charCount > 0
  const isOverLimit = charCount > MAX_CHARS
  const isTooShort = hasContent && wordCount < MIN_WORDS
  const isLowConfidence = hasContent && wordCount >= MIN_WORDS && wordCount < WARN_WORDS
  const isPasteLong = charCount >= PASTE_WARN_CHARS && charCount <= MAX_CHARS

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    // Enforce hard limit
    if (val.length > MAX_CHARS) {
      onChange(val.slice(0, MAX_CHARS))
    } else {
      onChange(val)
    }
  }

  function handleClear() {
    onChange('')
  }

  return (
    <div className="flex flex-col gap-2" id="panel-text" role="tabpanel" aria-label="Text input">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Paste your content here..."
          rows={9}
          aria-label="Content to analyze"
          aria-describedby="text-input-status"
          className={`
            w-full resize-none rounded-xl border
            bg-slate-50 dark:bg-slate-800/50
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-600
            text-sm leading-relaxed
            px-4 py-3.5
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
            ${isOverLimit
              ? 'border-red-300 dark:border-red-700'
              : 'border-slate-200 dark:border-slate-700'
            }
          `}
        />

        {/* Clear button — only shown when there is content */}
        {hasContent && !disabled && (
          <button
            onClick={handleClear}
            aria-label="Clear text"
            className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status row */}
      <div id="text-input-status" className="flex items-center justify-between text-xs px-0.5 min-h-[1.25rem]">
        {/* Left: warnings */}
        <span aria-live="polite">
          {isOverLimit && (
            <span className="text-red-500 dark:text-red-400">
              Content limit reached (10,000 characters)
            </span>
          )}
          {!isOverLimit && isPasteLong && (
            <span className="text-amber-500 dark:text-amber-400">
              Large content — analysis may take a moment
            </span>
          )}
          {!isOverLimit && !isPasteLong && isTooShort && (
            <span className="text-amber-500 dark:text-amber-400">
              Add more content for a meaningful analysis
            </span>
          )}
          {!isOverLimit && !isPasteLong && isLowConfidence && (
            <span className="text-slate-400 dark:text-slate-600">
              Short text — confidence will be low
            </span>
          )}
        </span>

        {/* Right: counters */}
        <span className={`tabular-nums ml-auto ${isOverLimit ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-600'}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
