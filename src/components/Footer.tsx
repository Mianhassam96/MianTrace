import type { Route } from '../hooks/useHashRoute'

interface FooterProps {
  onNavigate: (route: Route) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-100 dark:border-slate-800 py-8 px-5 mt-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                <path d="M2 9.5V2.5l4 4 4-4v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">MianTrace</span>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 dark:text-slate-600" aria-label="Footer navigation">
            <button
              onClick={() => onNavigate('analyzer')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Analyzer
            </button>
            <button
              onClick={() => onNavigate('methodology')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => onNavigate('faq')}
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              FAQ
            </button>
            <a
              href="https://github.com/Mianhassam96/MianTrace"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
              aria-label="MianTrace on GitHub"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {year} MianTrace
          </p>
        </div>

        <p className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-300 dark:text-slate-700 text-center leading-relaxed">
          MianTrace provides pattern-based writing analysis. Results are probabilistic estimates, not proof of authorship.
        </p>
      </div>
    </footer>
  )
}
