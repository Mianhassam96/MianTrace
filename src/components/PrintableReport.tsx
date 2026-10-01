/**
 * PrintableReport
 * Renders a clean, printer-friendly report as real DOM — hidden from the
 * screen UI but revealed by the @media print stylesheet.
 *
 * Using real DOM (not canvas/image) means:
 *  - Selectable, copyable text in the PDF
 *  - Accessible to screen readers
 *  - No external library dependencies
 *  - Correct page breaks via CSS
 */

import type { AnalysisResult, Signal } from '../types'

interface PrintableReportProps {
  result: AnalysisResult
}

const LEVEL_LABEL: Record<string, string> = {
  high: 'High', medium: 'Medium', low: 'Low',
}

const CONF_LABEL: Record<string, string> = {
  high: 'High', moderate: 'Moderate', low: 'Low',
}

const LEVEL_COLOR: Record<string, string> = {
  high:   '#dc2626',
  medium: '#d97706',
  low:    '#16a34a',
}

function ScoreRingPrint({ score }: { score: number }) {
  const color = score >= 70 ? '#dc2626' : score >= 45 ? '#d97706' : '#16a34a'
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" style={{ display: 'block' }}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7"/>
      <circle
        cx="55" cy="55" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 55 55)"
      />
      <text x="55" y="60" textAnchor="middle"
        style={{ fontSize: '22px', fontWeight: 700, fill: color, fontFamily: 'inherit' }}>
        {score}%
      </text>
    </svg>
  )
}

function SignalRow({ signal }: { signal: Signal }) {
  const pct = Math.round(signal.score * 100)
  const color = LEVEL_COLOR[signal.level] ?? '#64748b'

  return (
    <div className="print-no-break" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 80px 60px',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div>
        <div style={{ fontSize: '10pt', fontWeight: 600, color: '#0f172a' }}>
          {signal.name}
        </div>
        <div style={{ fontSize: '9pt', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>
          {signal.description}
        </div>
      </div>
      {/* Score bar */}
      <div style={{ height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }}/>
      </div>
      {/* Level badge */}
      <div style={{
        fontSize: '9pt', fontWeight: 700, color,
        textAlign: 'right', letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}>
        {LEVEL_LABEL[signal.level]}
      </div>
    </div>
  )
}

export function PrintableReport({ result }: PrintableReportProps) {
  const { aiLikelihood, confidence, statistics, signals, explanation, limitations } = result
  const generated = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const sorted = [...signals].sort((a, b) => {
    const o: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return (o[a.level] ?? 3) - (o[b.level] ?? 3)
  })

  const highSignals = signals.filter(s => s.level === 'high')

  const scoreColor = aiLikelihood >= 70 ? '#dc2626'
    : aiLikelihood >= 45 ? '#d97706' : '#16a34a'

  const scoreLabel = aiLikelihood >= 70 ? 'High AI-Likelihood'
    : aiLikelihood >= 45 ? 'Moderate AI-Likelihood'
    : aiLikelihood >= 25 ? 'Low-Moderate AI-Likelihood'
    : 'Low AI-Likelihood'

  const base: React.CSSProperties = {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#0f172a',
    fontSize: '10pt',
    lineHeight: 1.5,
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: '7.5pt',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#94a3b8',
    marginBottom: '8px',
    paddingBottom: '4px',
    borderBottom: '1px solid #e2e8f0',
  }

  const card: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '14px',
  }

  return (
    /* Hidden from screen, revealed by @media print */
    <div
      id="miantrace-print-report"
      style={{ ...base, display: 'none', maxWidth: '700px', margin: '0 auto', padding: '0 16px' }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="print-no-break" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', paddingBottom: '14px',
        borderBottom: '2px solid #2563eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo mark */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
              <polyline points="2,10 5,10 7,5 9,14 11,10 13,10 15,7 17,12 18,10"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14pt', fontWeight: 700, color: '#0f172a' }}>MianTrace</div>
            <div style={{ fontSize: '8pt', color: '#94a3b8' }}>AI-Likelihood Analysis Report</div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#94a3b8' }}>
          <div>{generated}</div>
          <div style={{ color: '#2563eb' }}>mianhassam96.github.io/MianTrace</div>
        </div>
      </div>

      {/* Website source */}
      {result.sourceMode === 'website' && result.websiteData && (
        <div className="print-no-break" style={{
          ...card, background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          <div style={sectionTitle}>Source</div>
          <div style={{ fontSize: '10pt', fontWeight: 600, color: '#0f172a' }}>
            {result.websiteData.title || result.websiteData.url}
          </div>
          <div style={{ fontSize: '9pt', color: '#2563eb' }}>{result.websiteData.url}</div>
          {result.websiteData.description && (
            <div style={{ fontSize: '9pt', color: '#64748b', marginTop: '2px' }}>
              {result.websiteData.description}
            </div>
          )}
        </div>
      )}

      {/* ── Score + overview row ─────────────────────────────────────────── */}
      <div className="print-no-break" style={{
        ...card, display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '24px', alignItems: 'center',
      }}>
        {/* Ring */}
        <div style={{ textAlign: 'center' }}>
          <ScoreRingPrint score={aiLikelihood}/>
          <div style={{ fontSize: '9.5pt', fontWeight: 600, color: scoreColor, marginTop: '4px' }}>
            {scoreLabel}
          </div>
          <div style={{
            display: 'inline-block', marginTop: '4px', fontSize: '8pt', fontWeight: 600,
            color: '#64748b', background: '#f1f5f9', borderRadius: '20px',
            padding: '2px 10px', border: '1px solid #e2e8f0',
          }}>
            {CONF_LABEL[confidence]} confidence
          </div>
        </div>

        {/* Stats */}
        <div>
          <div style={sectionTitle}>Content Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              ['Words', statistics.words.toLocaleString()],
              ['Characters', statistics.characters.toLocaleString()],
              ['Sentences', statistics.sentences.toLocaleString()],
              ['Paragraphs', statistics.paragraphs.toLocaleString()],
              ['Avg sentence', `${statistics.avgSentenceLength}w`],
              ['Vocabulary', `${Math.round(statistics.vocabularyDiversity * 100)}% unique`],
            ].map(([label, value]) => (
              <div key={label} style={{
                background: '#f8fafc', borderRadius: '6px', padding: '8px 12px',
                border: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: '11pt', fontWeight: 700, color: '#0f172a' }}>{value}</div>
                <div style={{ fontSize: '8.5pt', color: '#94a3b8' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Writing signals ──────────────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Writing Signals</div>
        {sorted.map(signal => (
          <SignalRow key={signal.id} signal={signal}/>
        ))}
      </div>

      {/* ── High signal detail ───────────────────────────────────────────── */}
      {highSignals.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>High Signal Detail</div>
          {highSignals.map((signal, i) => (
            <div key={signal.id} className="print-no-break" style={{
              marginBottom: i < highSignals.length - 1 ? '12px' : 0,
              paddingBottom: i < highSignals.length - 1 ? '12px' : 0,
              borderBottom: i < highSignals.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{ fontSize: '10pt', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                {signal.name}
              </div>
              <div style={{ fontSize: '9.5pt', color: '#475569', lineHeight: 1.5 }}>
                {signal.description}
              </div>
              {signal.suggestion && (
                <div style={{
                  marginTop: '6px', padding: '8px 12px',
                  background: '#eff6ff', borderRadius: '6px',
                  borderLeft: '3px solid #2563eb',
                }}>
                  <span style={{ fontSize: '9pt', fontWeight: 600, color: '#2563eb' }}>Suggestion: </span>
                  <span style={{ fontSize: '9pt', color: '#1e40af' }}>{signal.suggestion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Summary</div>
        <p style={{ margin: 0, fontSize: '10pt', color: '#475569', lineHeight: 1.6 }}>
          {explanation}
        </p>
      </div>

      {/* ── Limitation ──────────────────────────────────────────────────── */}
      <div className="print-no-break" style={{
        ...card,
        background: '#f8fafc',
        borderLeft: '3px solid #94a3b8',
      }}>
        <div style={{ fontSize: '8.5pt', fontWeight: 600, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Important
        </div>
        <p style={{ margin: 0, fontSize: '9pt', color: '#64748b', lineHeight: 1.5 }}>
          {limitations}
        </p>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={{
        marginTop: '16px', paddingTop: '12px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex', justifyContent: 'space-between',
        fontSize: '8pt', color: '#94a3b8',
      }}>
        <span>Generated by MianTrace</span>
        <span>mianhassam96.github.io/MianTrace</span>
      </div>
    </div>
  )
}
