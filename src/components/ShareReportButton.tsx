import { useState } from 'react'
import type { AnalysisResult } from '../types'
import { generateReport } from '../analysis/report'

interface ShareReportButtonProps {
  result: AnalysisResult
}

type ShareState = 'idle' | 'shared' | 'copied' | 'error'

export function ShareReportButton({ result }: ShareReportButtonProps) {
  const [state, setState] = useState<ShareState>('idle')

  async function handleShare() {
    if (state !== 'idle') return

    const reportText = generateReport(result)
    const title = 'MianTrace Analysis Report'
    const url = 'https://mianhassam96.github.io/MianTrace/'

    // Try native Web Share API first (mobile + modern desktop)
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: reportText, url })
        setState('shared')
        setTimeout(() => setState('idle'), 2500)
        return
      } catch (err) {
        // User cancelled share — don't treat as error
        if (err instanceof Error && err.name === 'AbortError') return
        // Fall through to clipboard fallback
      }
    }

    // Clipboard fallback — copy the link
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const supportsShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const STATES = {
    idle: {
      label: supportsShare ? 'Share' : 'Copy Link',
      icon: supportsShare ? (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M11.5 1a2.5 2.5 0 110 5 2.5 2.5 0 01-2.45-2h-2.1A2.5 2.5 0 114.5 6.5a2.48 2.48 0 01.95-.19l2.1-3.62A2.5 2.5 0 1111.5 1zM11.5 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM4.5 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          <path d="M5.45 8.69l2.1 3.62a2.5 2.5 0 11-.87.49L4.58 9.18a2.5 2.5 0 01-.08-.49h1.08l-.13 0z" opacity=".5"/>
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
        </svg>
      ),
      className: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    },
    shared: {
      label: 'Shared!',
      icon: (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-green-500" aria-hidden="true">
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      ),
      className: 'border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    copied: {
      label: 'Link copied!',
      icon: (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-green-500" aria-hidden="true">
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      ),
      className: 'border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    error: {
      label: 'Share failed',
      icon: (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-red-500" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4h1.5v4.5h-1.5V5zm0 5.5h1.5V12h-1.5v-1.5z"/>
        </svg>
      ),
      className: 'border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400',
    },
  }

  const { label, icon, className } = STATES[state]

  return (
    <button
      onClick={handleShare}
      disabled={state !== 'idle'}
      aria-label={supportsShare ? 'Share analysis report' : 'Copy link to MianTrace'}
      aria-live="polite"
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${className}`}
    >
      {icon}
      {label}
    </button>
  )
}
