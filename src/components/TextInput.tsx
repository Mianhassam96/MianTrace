interface TextInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

const MIN_WORDS = 50

export function TextInput({ value, onChange, disabled }: TextInputProps) {
  const wordCount = countWords(value)
  const charCount = value.length
  const hasContent = wordCount > 0
  const isTooShort = hasContent && wordCount < MIN_WORDS

  return (
    <div className="flex flex-col gap-2" id="panel-text" role="tabpanel" aria-label="Text input">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your content here..."
        rows={9}
        aria-label="Content to analyze"
        className="
          w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700
          bg-slate-50 dark:bg-slate-800/50
          text-slate-900 dark:text-slate-100
          placeholder-slate-400 dark:placeholder-slate-600
          text-sm leading-relaxed
          px-4 py-3.5
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
        "
      />

      {/* Counter row */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <span className={isTooShort ? 'text-amber-500 dark:text-amber-400' : 'text-transparent'}>
          {isTooShort ? `${MIN_WORDS - wordCount} more words for reliable results` : '.'}
        </span>
        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
          <span>
            <span className={`font-medium ${wordCount > 0 ? 'text-slate-600 dark:text-slate-400' : ''}`}>
              {wordCount.toLocaleString()}
            </span> {wordCount === 1 ? 'word' : 'words'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>
            <span className={`font-medium ${charCount > 0 ? 'text-slate-600 dark:text-slate-400' : ''}`}>
              {charCount.toLocaleString()}
            </span> {charCount === 1 ? 'character' : 'characters'}
          </span>
        </div>
      </div>
    </div>
  )
}
