import type { ReactNode } from 'react'
import type { AnalyzerTab } from '../types'

interface AnalyzerTabsProps {
  active: AnalyzerTab
  onChange: (tab: AnalyzerTab) => void
}

const TABS: { id: AnalyzerTab; label: string; icon: ReactNode }[] = [
  {
    id: 'text',
    label: 'Text',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M2 3h12v1.5H9v8H7v-8H2V3z" />
      </svg>
    ),
  },
  {
    id: 'website',
    label: 'Website',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM2.5 8a5.48 5.48 0 01.8-2.86C3.84 6.35 5.24 7 7 7.07V9c-1.85.07-3.29.78-3.85 1.91A5.47 5.47 0 012.5 8zm1.44 3.23C4.5 10.5 5.64 10 7 10v1.49A5.5 5.5 0 013.94 11.23zM7 12.5v-1.5c1.36 0 2.5-.5 3.06-1.27A5.5 5.5 0 017 12.5zm0-6.43C5.18 6 3.9 5.28 3.5 4.2A5.5 5.5 0 017 2.5v3.57zM8.5 2.56A5.5 5.5 0 0112.5 7h-1.52C10.88 5.34 9.83 3.98 8.5 2.56zm0 10.88c1.33-1.42 2.38-2.78 2.48-4.44H12.5a5.5 5.5 0 01-4 4.44zM8.5 9V7.07C10.26 7 11.66 6.35 12.2 5.14A5.48 5.48 0 0113.5 8c0 .38-.04.74-.11 1.09C12.83 8.44 10.97 8.07 8.5 9z" />
      </svg>
    ),
  },
]

export function AnalyzerTabs({ active, onChange }: AnalyzerTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit" role="tablist" aria-label="Analyzer input type">
      {TABS.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          aria-controls={`panel-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150
            ${active === tab.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
