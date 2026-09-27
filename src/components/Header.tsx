interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
}

export function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">

        {/* Logo */}
        <a href="." className="flex items-center gap-2 group" aria-label="MianTrace home">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" aria-hidden="true">
              <path d="M4 14V6l6 6 6-6v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-[15px] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            MianTrace
          </span>
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <a
            href="#how-it-works"
            className="hidden sm:inline-flex text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            How It Works
          </a>

          <button
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="ml-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 011.415 1.415l-.708.707a1 1 0 01-1.414-1.414l.707-.708zM18 9a1 1 0 010 2h-1a1 1 0 010-2h1zM4.93 14.364l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 10a1 1 0 01-1-1H1a1 1 0 010 2h1a1 1 0 01-1-1zm13.364.707l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414zM5.636 4.222l-.707-.707A1 1 0 013.515 4.93l.707.707a1 1 0 001.414-1.415zM10 6a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
