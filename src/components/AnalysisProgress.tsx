import { useEffect, useState } from 'react'
import type { AnalyzerTab } from '../types'

interface AnalysisProgressProps {
  mode: AnalyzerTab
}

interface Step {
  label: string
  durationMs: number
}

const TEXT_STEPS: Step[] = [
  { label: 'Preparing text',          durationMs: 150 },
  { label: 'Measuring writing patterns', durationMs: 300 },
  { label: 'Evaluating signals',       durationMs: 400 },
  { label: 'Preparing results',        durationMs: 200 },
]

const WEBSITE_STEPS: Step[] = [
  { label: 'Validating URL',           durationMs: 100 },
  { label: 'Fetching website',         durationMs: 600 },
  { label: 'Extracting page content',  durationMs: 400 },
  { label: 'Analyzing writing patterns', durationMs: 400 },
  { label: 'Preparing results',        durationMs: 200 },
]

export function AnalysisProgress({ mode }: AnalysisProgressProps) {
  const steps = mode === 'text' ? TEXT_STEPS : WEBSITE_STEPS
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
    let current = 0

    function advance() {
      current += 1
      if (current < steps.length) {
        setActiveIndex(current)
        setTimeout(advance, steps[current].durationMs)
      }
    }

    const timer = setTimeout(advance, steps[0].durationMs)
    return () => clearTimeout(timer)
  }, [mode, steps.length])

  return (
    <div
      role="status"
      aria-label={`Analysis in progress: ${steps[activeIndex]?.label}`}
      aria-live="polite"
      className="flex flex-col gap-2.5 py-1"
    >
      {steps.map((step, i) => {
        const isDone    = i < activeIndex
        const isActive  = i === activeIndex
        const isPending = i > activeIndex

        return (
          <div key={step.label} className="flex items-center gap-2.5">
            {/* Indicator */}
            <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
              {isDone && (
                <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true">
                  <path d="M11.78 3.22a.75.75 0 010 1.06L5.56 10.5a.75.75 0 01-1.06 0L2.22 8.22a.75.75 0 111.06-1.06L5 8.94l5.72-5.72a.75.75 0 011.06 0z"/>
                </svg>
              )}
              {isActive && (
                <svg className="w-3.5 h-3.5 animate-spin text-blue-500 dark:text-blue-400" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <circle className="opacity-20" cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="2"/>
                  <path className="opacity-80" fill="currentColor" d="M7 1.5a5.5 5.5 0 015.5 5.5h-2A3.5 3.5 0 007 3.5v-2z"/>
                </svg>
              )}
              {isPending && (
                <span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto block" aria-hidden="true"/>
              )}
            </div>

            {/* Label */}
            <span className={`text-sm transition-colors duration-200 ${
              isDone    ? 'text-slate-400 dark:text-slate-600' :
              isActive  ? 'text-slate-900 dark:text-slate-100 font-medium' :
                          'text-slate-300 dark:text-slate-700'
            }`}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
