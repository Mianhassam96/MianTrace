interface TextInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

const MIN_WORDS = 50
const WARN_WORDS = 100

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  const wordCount = countWords(value)
  const charCount = value.length
  const hasContent = wordCount > 0
  const isTooShort = hasContent && wordCount < MIN_WORDS
  const isLowConfidence = hasContent && wordCount >= MIN_WORDS && wordCount < WARN_WORDS

  return (
    <div className="flex flex-col gap-2" id="panel-text" role="tabpanel" aria-label="Text input">
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Paste your content here..."
          rows={10}
          aria-label="Content to analyze"
          className="
            w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-600
            text-sm leading-relaxed
            px-4 py-3.5
            focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150
          "
        />
      </div>

      {/* Counters + status */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <div className="flex items-center gap-1.5">
          {isTooShort && (
            <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
              <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                <path d="M7 1L1 12h12L7 1zm0 2.3l4.6 7.7H2.4L7 3.3zM6.4 6v2.5h1.2V6H6.4zm0 3v1.2h1.2V9H6.4z" />
              </svg>
              Add at least {MIN_WORDS - wordCount} more words for reliable results
            </span>
          )}
          {isLowConfidence && (
            <span className="text-amber-500 dark:text-amber-400">
              Short text — confidence will be low
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-600 ml-auto">
          <span>
            <span className={`font-medium ${wordCount > 0 ? 'text-gray-600 dark:text-gray-400' : ''}`}>
              {wordCount.toLocaleString()}
            </span>{' '}
            {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span>
            <span className={`font-medium ${charCount > 0 ? 'text-gray-600 dark:text-gray-400' : ''}`}>
              {charCount.toLocaleString()}
            </span>{' '}
            {charCount === 1 ? 'character' : 'characters'}
          </span>
        </div>
      </div>
    </div>
  )
}
