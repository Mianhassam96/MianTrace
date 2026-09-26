import { useMemo, useState } from 'react'
import './App.css'

import { useDarkMode } from './hooks/useDarkMode'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { AnalyzerTabs } from './components/AnalyzerTabs'
import { TextInput } from './components/TextInput'
import { UrlInput } from './components/UrlInput'
import { AnalyzeButton } from './components/AnalyzeButton'
import { ErrorState } from './components/ErrorState'
import { StatsBar } from './components/StatsBar'
import { HowItWorks } from './components/HowItWorks'
import { Footer } from './components/Footer'

import { computeStatistics } from './analysis'
import type { AnalyzerTab } from './types'

// ─── App state type ───────────────────────────────────────────────────────────
type AppStatus = 'idle' | 'loading' | 'error'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  // Input state
  const [activeTab, setActiveTab] = useState<AnalyzerTab>('text')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')

  // Async state
  const [status, setStatus] = useState<AppStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // ─── Live statistics (text tab only) ────────────────────────────────────
  // Computed on every keystroke — deterministic and fast
  const textStats = useMemo(
    () => (textContent.trim() ? computeStatistics(textContent) : null),
    [textContent]
  )

  // ─── Derived values ──────────────────────────────────────────────────────
  const isTextTab = activeTab === 'text'
  const wordCount = textStats?.words ?? 0

  const isUrlValid = (() => {
    try {
      const url = new URL(urlContent.trim())
      return url.protocol === 'https:'
    } catch {
      return false
    }
  })()

  const canAnalyze = isTextTab ? wordCount >= 10 : isUrlValid
  const isLoading = status === 'loading'
  const showStats = isTextTab && textStats !== null && wordCount > 0

  // ─── Handlers ────────────────────────────────────────────────────────────
  function handleTabChange(tab: AnalyzerTab) {
    setActiveTab(tab)
    setStatus('idle')
    setErrorMessage('')
  }

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return
    setStatus('loading')
    setErrorMessage('')

    try {
      // Phase 4–5 will run the full signal engine here
      await new Promise(resolve => setTimeout(resolve, 1200))
      // Placeholder: reset to idle — Phase 5 will set status = 'success'
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      )
    }
  }

  function handleRetry() {
    setStatus('idle')
    setErrorMessage('')
    handleAnalyze()
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col">
      <Header isDark={isDark} onToggleDark={toggle} />

      <main className="flex-1" id="main-content">
        <Hero />

        {/* ── Analyzer card ───────────────────────────────────────────── */}
        <section className="px-4 pb-16" aria-label="Content analyzer">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 flex flex-col gap-5">

              {/* Tabs */}
              <AnalyzerTabs active={activeTab} onChange={handleTabChange} />

              {/* Input panel */}
              {isTextTab ? (
                <TextInput
                  value={textContent}
                  onChange={setTextContent}
                  disabled={isLoading}
                />
              ) : (
                <UrlInput
                  value={urlContent}
                  onChange={setUrlContent}
                  disabled={isLoading}
                />
              )}

              {/* Error state */}
              {status === 'error' && (
                <ErrorState message={errorMessage} onRetry={handleRetry} />
              )}

              {/* Action row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <p className="text-xs text-gray-400 dark:text-gray-600 text-center sm:text-left">
                  {isTextTab
                    ? wordCount === 0
                      ? 'Paste any content above to get started'
                      : canAnalyze
                        ? `${wordCount.toLocaleString()} words ready to analyze`
                        : 'Add at least 10 words to analyze'
                    : !urlContent
                      ? 'Enter a URL above to get started'
                      : isUrlValid
                        ? 'URL ready to analyze'
                        : 'Enter a valid HTTPS URL'
                  }
                </p>

                <AnalyzeButton
                  onClick={handleAnalyze}
                  loading={isLoading}
                  disabled={!canAnalyze}
                />
              </div>
            </div>

            {/* ── Live stats bar — appears as soon as text is entered ── */}
            {showStats && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <StatsBar stats={textStats!} />
              </div>
            )}

            {/* Results placeholder — Phase 6 will render results here */}
            {/* {result && <ResultsPanel result={result} />} */}
          </div>
        </section>

        {/* How It Works */}
        <HowItWorks />
      </main>

      <Footer />
    </div>
  )
}
