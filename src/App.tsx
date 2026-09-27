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
import { fetchWebsiteContent } from './api/worker-client'
import type { AnalysisResult, AnalyzerTab } from './types'

type AppStatus = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  const [activeTab, setActiveTab]     = useState<AnalyzerTab>('text')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent]   = useState('')
  const [status, setStatus]           = useState<AppStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult]           = useState<AnalysisResult | null>(null)

  // Live statistics
  const textStats = useMemo(
    () => (textContent.trim() ? computeStatistics(textContent) : null),
    [textContent]
  )

  // Derived
  const isTextTab  = activeTab === 'text'
  const wordCount  = textStats?.words ?? 0
  const isUrlValid = (() => {
    try { const u = new URL(urlContent.trim()); return u.protocol === 'https:' }
    catch { return false }
  })()
  const canAnalyze = isTextTab ? wordCount >= 10 : isUrlValid
  const isLoading  = status === 'loading'
  const showStats  = isTextTab && textStats !== null && wordCount > 0 && status !== 'success'
  const showResults = status === 'success' && result !== null

  function handleTabChange(tab: AnalyzerTab) {
    setActiveTab(tab); setStatus('idle'); setErrorMessage(''); setResult(null)
  }

  function handleReset() {
    setStatus('idle'); setResult(null); setErrorMessage('')
    document.getElementById('analyzer-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  function clearResultOnEdit() {
    if (status === 'success') { setStatus('idle'); setResult(null) }
  }

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return
    setStatus('loading'); setErrorMessage(''); setResult(null)

    try {
      if (isTextTab) {
        await new Promise<void>(r => setTimeout(r, 50))
        const stats = computeStatistics(textContent)
        setResult({ ...runSignalEngine(stats), sourceMode: 'text' })
        setStatus('success')
        setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        const workerResult = await fetchWebsiteContent(urlContent.trim())
        if (!workerResult.ok) throw new Error(workerResult.error)
        const { data } = workerResult
        await new Promise<void>(r => setTimeout(r, 50))
        const stats = computeStatistics(data.content)
        setResult({
          ...runSignalEngine(stats),
          sourceMode: 'website',
          websiteData: { url: data.url, title: data.title, description: data.description, headings: data.headings, paragraphCount: data.paragraphCount, wordCount: data.wordCount },
        })
        setStatus('success')
        setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      <Header isDark={isDark} onToggleDark={toggle}/>

      <main className="flex-1" id="main-content">
        {!showResults && <Hero/>}

        {/* ── Analyzer ─────────────────────────────────────────────── */}
        <section id="analyzer-section" className="px-4 sm:px-5 pb-6" aria-label="Content analyzer">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">

            {/* Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 flex flex-col gap-4">

              {/* Card header */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                  Analyze content
                </p>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 -mx-1" aria-hidden="true"/>

              <AnalyzerTabs active={activeTab} onChange={handleTabChange}/>

              {isTextTab ? (
                <TextInput value={textContent} onChange={v => { setTextContent(v); clearResultOnEdit() }} disabled={isLoading}/>
              ) : (
                <UrlInput value={urlContent} onChange={v => { setUrlContent(v); clearResultOnEdit() }} disabled={isLoading}/>
              )}

              {status === 'error' && (
                <ErrorState message={errorMessage} onRetry={() => { setStatus('idle'); setErrorMessage(''); handleAnalyze() }}/>
              )}

              {/* Action row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-400 dark:text-slate-600 text-center sm:text-left">
                  {isTextTab
                    ? wordCount === 0 ? 'Paste any content above to get started'
                      : canAnalyze ? `${wordCount.toLocaleString()} words ready to analyze`
                      : 'Add at least 10 words to analyze'
                    : !urlContent ? 'Enter a URL above to get started'
                      : isUrlValid ? 'URL ready to analyze'
                      : 'Enter a valid HTTPS URL'
                  }
                </p>
                <AnalyzeButton
                  onClick={handleAnalyze}
                  loading={isLoading}
                  disabled={!canAnalyze}
                  label={isTextTab ? 'Analyze Content' : 'Analyze Website'}
                />
              </div>
            </div>

            {/* Live stats bar */}
            {showStats && <StatsBar stats={textStats!}/>}

            {/* Trust line */}
            {!showResults && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-600">
                No signup required · Transparent analysis · Pattern-based results
              </p>
            )}
          </div>
        </section>

        {/* ── Results ──────────────────────────────────────────────── */}
        {showResults && (
          <section id="results-section" className="px-4 sm:px-5 pb-16 scroll-mt-16" aria-label="Analysis results">
            <div className="max-w-2xl mx-auto">
              <ResultsPanel result={result!} onReset={handleReset}/>
            </div>
          </section>
        )}

        {/* How It Works */}
        {!showResults && <HowItWorks/>}
      </main>

      <Footer/>
    </div>
  )
}
