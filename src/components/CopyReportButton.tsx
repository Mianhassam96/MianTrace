import { useState } from 'react'
import type { AnalysisResult } from '../types'
import { generateReport } from '../analysis/report'

interface CopyReportButtonProps {
  result: AnalysisResult
}

type CopyState = 'idle' | 'copying' | 'copied' | 'error'

export function CopyReportButton({ result }: CopyReportButtonProps) {
  const [state, setState] = useState<CopyState>('idle')

  async function handleCopy() {
    if (state === 'copying' || state === 'copied') return

    setState('copying')
    try {
      const report = generateReport(result)
      await navigator.clipboard.writeText(report)
      setState('copied')
      // Reset after 2.5s
      setTimeout(() => setState('idle'), 2500)
    } catch {
      // Clipboard API unavailable — try execCommand fallback
      try {
        const report = generateReport(result)
        const textarea = document.createElement('textarea')
        textarea.value = report
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)
        setState(success ? 'copied' : 'error')
        if (success) setTimeout(() => setState('idle'), 2500)
        else setTimeout(() => setState('idle'), 3000)
      } catch {
        setState('error')
        setTimeout(() => setState('idle'), 3000)
      }
    }
  }

  const STATES = {
    idle: {
      label: 'Copy Report',
      icon: (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h5a2 2 0 002-2V7l-4-5H4zm4 0l3 4h-3V2zM2.5 4A1.5 1.5 0 014 2.5h3.5V6H11v6a1.5 1.5 0 01-1.5 1.5H4A1.5 1.5 0 012.5 12V4z"/>
          <path d="M6 4.5h4V6H8.5v1H12a.5.5 0 01.5.5V13a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V5a.5.5 0 01.5-.5z" opacity=".4"/>
        </svg>
      ),
      className: 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    },
    copying: {
      label: 'Copying…',
      icon: (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
          <path className="opacity-75" fill="currentColor" d="M8 2a6 6 0 016 6h-2a4 4 0 00-4-4V2z"/>
        </svg>
      ),
      className: 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-wait',
    },
    copied: {
      label: 'Copied!',
      icon: (
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-green-500" aria-hidden="true">
          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
        </svg>
      ),
      className: 'border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    },
    error: {
      label: 'Copy failed',
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
      onClick={handleCopy}
      disabled={state === 'copying'}
      aria-label="Copy analysis report to clipboard"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${className}`}
    >
      {icon}
      {label}
    </button>
  )
}
