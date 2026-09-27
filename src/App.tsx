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
import { ResultsPanel } from './components/ResultsPanel'
import { HowItWorks } from './components/HowItWorks'
import { Footer } from './components/Footer'

import { computeStatistics, runSignalEngine } from './analysis'
import type { AnalysisResult, AnalyzerTab } from './types'

// ─── App state ────────────────────────────────────────────────────────────────
type AppStatus = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  // Input state
  const [activeTab, setActiveTab] = useState<AnalyzerTab>('text')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')

  // Async state
  const [status, setStatus] = useState<AppStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  // ─── Live statistics (text tab, computed on every keystroke) ─────────────
  const textStats = useMemo(
    () => (textContent.trim() ? computeStatistics(textContent) : null),
    [textContent]
  )

  // ─── Derived values ───────────────────────────────────────────────────────
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
  const showStats = isTextTab && textStats !== null && wordCount > 0 && status !== 'success'
  const showResults = status === 'success' && result !== null

  // ─── Handlers ────────────────────────────────────────────────────────────
  function handleTabChange(tab: AnalyzerTab) {
    setActiveTab(tab)
    setStatus('idle')
    setErrorMessage('')
    setResult(null)
  }

  function handleReset() {
    setStatus('idle')
    setResult(null)
    setErrorMessage('')
    // Scroll back to analyzer
    document.getElementById('analyzer-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return
    setStatus('loading')
    setErrorMessage('')
    setResult(null)

    try {
      if (isTextTab) {
        // Run the full analysis engine synchronously (it's fast — no network)
        // Wrap in a tiny timeout so the loading spinner renders first
        await new Promise<void>(resolve => setTimeout(resolve, 50))
        const stats = computeStatistics(textContent)
        const analysisResult = runSignalEngine(stats)
        setResult(analysisResult)
        setStatus('success')
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        // Phase 9 — website fetch via Cloudflare Worker
        // Placeholder until the worker is built
        throw new Error('Website analysis is coming in Phase 9. Use text mode for now.')
      }
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
        {/* Only show hero when not showing results */}
        {!showResults && <Hero />}

        {/* ── Analyzer card ────────────────────────────────────────────── */}
        <section
          id="analyzer-section"
          className="px-4 pb-8"
          aria-label="Content analyzer"
        >
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 flex flex-col gap-5">

              {/* Tabs */}
              <AnalyzerTabs active={activeTab} onChange={handleTabChange} />

              {/* Input panel */}
              {isTextTab ? (
                <TextInput
                  value={textContent}
                  onChange={val => { setTextContent(val); if (status === 'success') setStatus('idle'); setResult(null) }}
                  disabled={isLoading}
                />
              ) : (
                <UrlInput
                  value={urlContent}
                  onChange={val => { setUrlContent(val); if (status === 'success') setStatus('idle'); setResult(null) }}
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

            {/* Live stats bar */}
            {showStats && (
              <StatsBar stats={textStats!} />
            )}
          </div>
        </section>

        {/* ── Results ──────────────────────────────────────────────────── */}
        {showResults && (
          <section
            id="results-section"
            className="px-4 pb-16"
            aria-label="Analysis results"
          >
            <div className="max-w-2xl mx-auto">
              <ResultsPanel result={result!} onReset={handleReset} />
            </div>
          </section>
        )}

        {/* How It Works — only show when no results */}
        {!showResults && <HowItWorks />}
      </main>

      <Footer />
    </div>
  )
}
