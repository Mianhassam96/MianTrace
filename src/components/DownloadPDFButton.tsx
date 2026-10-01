import { useState } from 'react'

interface DownloadPDFButtonProps {
  onPrint: () => void
}

type PrintState = 'idle' | 'preparing'

export function DownloadPDFButton({ onPrint }: DownloadPDFButtonProps) {
  const [state, setState] = useState<PrintState>('idle')

  function handleClick() {
    if (state === 'preparing') return
    setState('preparing')

    // Give React one frame to ensure the PrintableReport is in DOM
    // before triggering the print dialog
    setTimeout(() => {
      onPrint()
      // Reset after dialog closes (print dialog is synchronous on most browsers)
      setTimeout(() => setState('idle'), 500)
    }, 80)
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'preparing'}
      aria-label="Download analysis as PDF"
      className={`
        w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium
        transition-all duration-150
        ${state === 'preparing'
          ? 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-wait'
          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }
      `}
    >
      {state === 'preparing' ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
            <path className="opacity-75" fill="currentColor" d="M8 2a6 6 0 016 6h-2a4 4 0 00-4-4V2z"/>
          </svg>
          Preparing…
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M8 1a.75.75 0 01.75.75v6.69l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.53a.75.75 0 011.06-1.06L7.25 8.44V1.75A.75.75 0 018 1zM1.5 11.5A1.5 1.5 0 013 10h1.5a.75.75 0 010 1.5H3v2h10v-2h-1.5a.75.75 0 010-1.5H13a1.5 1.5 0 011.5 1.5v2A1.5 1.5 0 0113 15H3a1.5 1.5 0 01-1.5-1.5v-2z"/>
          </svg>
          Download PDF
        </>
      )}
    </button>
  )
}
