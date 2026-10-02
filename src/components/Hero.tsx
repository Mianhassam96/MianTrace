import type { Route } from '../hooks/useHashRoute'

interface HeroProps {
  onNavigate: (route: Route) => void
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="pt-10 pb-6 text-center px-5">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 border border-blue-100 dark:border-blue-900/60 tracking-wide uppercase">
          <span className="text-blue-500" aria-hidden="true">✦</span>
          Writing Pattern Analysis
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-3 text-balance">
          Understand the signals
          <br />
          <span className="text-blue-600 dark:text-blue-400">behind your content.</span>
        </h1>

        <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-5">
          Analyze text and webpages for writing patterns commonly associated
          with AI-generated content. Transparent, explainable, and privacy-conscious.
        </p>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-400 dark:text-slate-600">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3 text-green-500" aria-hidden="true">
              <path d="M11.78 3.22a.75.75 0 010 1.06L5.56 10.5a.75.75 0 01-1.06 0L2.22 8.22a.75.75 0 111.06-1.06L5 8.94l5.72-5.72a.75.75 0 011.06 0z"/>
            </svg>
            No signup required
          </span>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3 text-green-500" aria-hidden="true">
              <path d="M11.78 3.22a.75.75 0 010 1.06L5.56 10.5a.75.75 0 01-1.06 0L2.22 8.22a.75.75 0 111.06-1.06L5 8.94l5.72-5.72a.75.75 0 011.06 0z"/>
            </svg>
            Text stays in your browser
          </span>
          <button
            onClick={() => onNavigate('methodology')}
            className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
          >
            <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3" aria-hidden="true">
              <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm.75 8.5h-1.5v-4h1.5v4zm0-5h-1.5V3h1.5v1.5z"/>
            </svg>
            How signals work
          </button>
        </div>
      </div>
    </section>
  )
}
