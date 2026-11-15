/**
 * PrintableReport
 * Renders a clean, printer-friendly report as real DOM.
 * Accepts CombinedResult — covers both Writing Analysis and Visibility Readiness.
 * Hidden from screen, revealed by @media print stylesheet.
 */

import type { CombinedResult, Signal, VisibilityDimension } from '../types'

interface PrintableReportProps {
  result: CombinedResult
}

const LEVEL_LABEL: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' }
const CONF_LABEL: Record<string, string>  = { high: 'High', moderate: 'Moderate', low: 'Low' }
const SIGNAL_COLOR: Record<string, string> = { high: '#dc2626', medium: '#d97706', low: '#16a34a' }
const DIM_COLOR: Record<string, string>    = { high: '#16a34a', medium: '#d97706', low: '#dc2626' }

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRingPrint({ score, color }: { score: number; color: string }) {
  const r = 40, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 50 50)"/>
      <text x="50" y="55" textAnchor="middle"
        style={{ fontSize: '18px', fontWeight: 700, fill: color, fontFamily: 'inherit' }}>
        {score}{score <= 100 && score >= 0 ? '%' : ''}
      </text>
    </svg>
  )
}

// ─── Writing signal row ───────────────────────────────────────────────────────

function SignalRow({ signal }: { signal: Signal }) {
  const pct = Math.round(signal.score * 100)
  const color = SIGNAL_COLOR[signal.level] ?? '#64748b'
  return (
    <div className="print-no-break" style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 56px',
      alignItems: 'center', gap: '10px', padding: '7px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{ fontSize: '9.5pt', fontWeight: 600, color: '#0f172a' }}>{signal.name}</div>
      <div style={{ height: '5px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }}/>
      </div>
      <div style={{ fontSize: '8pt', fontWeight: 700, color, textAlign: 'right', textTransform: 'uppercase' }}>
        {LEVEL_LABEL[signal.level]}
      </div>
    </div>
  )
}

// ─── Visibility dimension row ─────────────────────────────────────────────────

function DimRow({ dim }: { dim: VisibilityDimension }) {
  const color = DIM_COLOR[dim.level] ?? '#64748b'
  return (
    <div className="print-no-break" style={{
      display: 'grid', gridTemplateColumns: '1fr 80px 56px',
      alignItems: 'center', gap: '10px', padding: '7px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{ fontSize: '9.5pt', fontWeight: 600, color: '#0f172a' }}>{dim.name}</div>
      <div style={{ height: '5px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${dim.score}%`, height: '100%', background: color, borderRadius: '3px' }}/>
      </div>
      <div style={{ fontSize: '8pt', fontWeight: 700, color, textAlign: 'right' }}>{dim.score}/100</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PrintableReport({ result }: PrintableReportProps) {
  const { writing, visibility } = result
  const { aiLikelihood, confidence, statistics, signals, explanation } = writing

  const generated = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const writingColor  = aiLikelihood >= 70 ? '#dc2626' : aiLikelihood >= 45 ? '#d97706' : '#16a34a'
  const writingLabel  = aiLikelihood >= 70 ? 'High AI-Likelihood'
    : aiLikelihood >= 45 ? 'Moderate AI-Likelihood' : 'Low AI-Likelihood'

  const visColor = visibility.overallScore >= 70 ? '#16a34a'
    : visibility.overallScore >= 40 ? '#d97706' : '#dc2626'
  const visLabel = visibility.overallScore >= 70 ? 'High Readiness'
    : visibility.overallScore >= 40 ? 'Moderate Readiness' : 'Low Readiness'

  const sortedSignals = [...signals].sort((a,b) => {
    const o: Record<string,number> = { high:0, medium:1, low:2 }
    return (o[a.level]??3)-(o[b.level]??3)
  })
  const sortedDims = [...visibility.dimensions].sort((a,b) => a.score - b.score)
  const highSignals = signals.filter(s => s.level === 'high')

  const base: React.CSSProperties = {
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
    color: '#0f172a', fontSize: '10pt', lineHeight: 1.5,
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: '7pt', fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.1em', color: '#94a3b8',
    marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0',
  }
  const card: React.CSSProperties = {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '10px', padding: '14px 18px', marginBottom: '12px',
  }

  return (
    <div id="miantrace-print-report"
      style={{ ...base, display: 'none', maxWidth: '700px', margin: '0 auto', padding: '0 16px' }}>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="print-no-break" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '18px', paddingBottom: '12px', borderBottom: '2px solid #2563eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'#2563eb',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
              <polyline points="2,10 5,10 7,5 9,14 11,10 13,10 15,7 17,12 18,10"
                stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13pt', fontWeight: 700 }}>MianTrace</div>
            <div style={{ fontSize: '8pt', color: '#94a3b8' }}>AI Text & Visibility Intelligence</div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8pt', color: '#94a3b8' }}>
          <div>{generated}</div>
          <div style={{ color: '#2563eb' }}>mianhassam96.github.io/MianTrace</div>
        </div>
      </div>

      {/* ── Website source ───────────────────────────────────────────── */}
      {result.sourceMode === 'website' && result.websiteData && (
        <div className="print-no-break" style={{ ...card, background: '#f8fafc' }}>
          <div style={sectionTitle}>Source</div>
          <div style={{ fontSize: '10pt', fontWeight: 600 }}>
            {result.websiteData.title || result.websiteData.url}
          </div>
          <div style={{ fontSize: '9pt', color: '#2563eb' }}>{result.websiteData.url}</div>
          {result.websiteData.description && (
            <div style={{ fontSize: '9pt', color: '#64748b', marginTop: '3px' }}>
              {result.websiteData.description}
            </div>
          )}
        </div>
      )}

      {/* ── Combined score summary ───────────────────────────────────── */}
      <div className="print-no-break" style={{
        ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', paddingRight: '16px', borderRight: '1px solid #e2e8f0' }}>
          <div style={sectionTitle}>AI Writing Analysis</div>
          <ScoreRingPrint score={aiLikelihood} color={writingColor}/>
          <div style={{ fontSize: '9pt', fontWeight: 600, color: writingColor }}>{writingLabel}</div>
          <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{CONF_LABEL[confidence]} confidence</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', paddingLeft: '16px' }}>
          <div style={sectionTitle}>Visibility Readiness</div>
          <ScoreRingPrint score={visibility.overallScore} color={visColor}/>
          <div style={{ fontSize: '9pt', fontWeight: 600, color: visColor }}>{visLabel}</div>
          <div style={{ fontSize: '8pt', color: '#94a3b8' }}>{CONF_LABEL[visibility.confidence]} confidence</div>
        </div>
      </div>

      {/* ── Content overview ─────────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Content Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          {[
            ['Words', statistics.words.toLocaleString()],
            ['Sentences', statistics.sentences.toLocaleString()],
            ['Paragraphs', statistics.paragraphs.toLocaleString()],
            ['Characters', statistics.characters.toLocaleString()],
            ['Avg sentence', `${statistics.avgSentenceLength}w`],
            ['Vocabulary', `${Math.round(statistics.vocabularyDiversity * 100)}% unique`],
          ].map(([label, value]) => (
            <div key={label} style={{ background:'#f8fafc', borderRadius:'6px',
              padding:'7px 10px', border:'1px solid #f1f5f9' }}>
              <div style={{ fontSize:'10pt', fontWeight:700 }}>{value}</div>
              <div style={{ fontSize:'8pt', color:'#94a3b8' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Writing signals ──────────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Writing Signals</div>
        {sortedSignals.map(s => <SignalRow key={s.id} signal={s}/>)}
      </div>

      {/* ── High signal detail ───────────────────────────────────────── */}
      {highSignals.length > 0 && (
        <div style={card}>
          <div style={sectionTitle}>High Signal Detail</div>
          {highSignals.map((s, i) => (
            <div key={s.id} className="print-no-break" style={{
              marginBottom: i < highSignals.length-1 ? '10px' : 0,
              paddingBottom: i < highSignals.length-1 ? '10px' : 0,
              borderBottom: i < highSignals.length-1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{ fontSize:'9.5pt', fontWeight:700, color:'#dc2626', marginBottom:'3px' }}>
                {s.name}
              </div>
              <div style={{ fontSize:'9pt', color:'#475569', lineHeight:1.4 }}>{s.description}</div>
              {s.suggestion && (
                <div style={{ marginTop:'5px', padding:'6px 10px', background:'#eff6ff',
                  borderRadius:'6px', borderLeft:'3px solid #2563eb' }}>
                  <span style={{ fontSize:'8.5pt', fontWeight:600, color:'#2563eb' }}>Suggestion: </span>
                  <span style={{ fontSize:'8.5pt', color:'#1e40af' }}>{s.suggestion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Writing summary ──────────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Writing Analysis Summary</div>
        <p style={{ margin:0, fontSize:'9.5pt', color:'#475569', lineHeight:1.6 }}>{explanation}</p>
      </div>

      {/* ── Visibility dimensions ─────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Visibility Readiness Dimensions</div>
        {sortedDims.map(d => <DimRow key={d.id} dim={d}/>)}
      </div>

      {/* ── Visibility summary ───────────────────────────────────────── */}
      <div className="print-no-break" style={card}>
        <div style={sectionTitle}>Visibility Analysis Summary</div>
        <p style={{ margin:0, fontSize:'9.5pt', color:'#475569', lineHeight:1.6 }}>
          {visibility.explanation}
        </p>
      </div>

      {/* ── Limitations ──────────────────────────────────────────────── */}
      <div className="print-no-break" style={{ ...card, background:'#f8fafc', borderLeft:'3px solid #94a3b8' }}>
        <div style={{ fontSize:'8pt', fontWeight:600, color:'#64748b', marginBottom:'4px',
          textTransform:'uppercase', letterSpacing:'0.08em' }}>Important</div>
        <p style={{ margin:0, fontSize:'8.5pt', color:'#64748b', lineHeight:1.5 }}>
          AI writing scores are probabilistic estimates based on writing patterns — not proof of authorship.
          Visibility scores estimate content readiness based on structural signals — not a guarantee of AI search inclusion.
        </p>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{ marginTop:'14px', paddingTop:'10px', borderTop:'1px solid #e2e8f0',
        display:'flex', justifyContent:'space-between', fontSize:'8pt', color:'#94a3b8' }}>
        <span>Generated by MianTrace</span>
        <span>mianhassam96.github.io/MianTrace</span>
      </div>
    </div>
  )
}
