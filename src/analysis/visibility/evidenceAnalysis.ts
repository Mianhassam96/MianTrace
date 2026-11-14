/**
 * evidenceAnalysis.ts
 * Evaluates evidence quality: statistics, citations, sources, examples.
 * Weight: 15
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

export function analyzeEvidence(
  stats: FullStatistics,
  text: string,
  _headings?: string[]
): VisibilityDimension {
  const weight = 15

  if (stats.words < 20) {
    return {
      id: 'evidence-quality',
      name: 'Evidence & Citations',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to evaluate evidence quality.'],
      recommendation: 'Include statistics, citations, named sources, and concrete examples.',
    }
  }

  const lower = text.toLowerCase()

  // 1. Specific numbers/statistics: percentages, currency, measurements
  const statsPattern = /\d+(?:\.\d+)?%|\$\d[\d,]*(?:\.\d{2})?|\d+(?:\.\d+)?\s*(?:km|m|kg|lb|mph|ms|gb|mb|tb)/gi
  const specificNumberCount = (text.match(statsPattern) ?? []).length

  // 2. Citation patterns
  const citationPatterns = [
    'according to',
    'research shows',
    'studies indicate',
    'data shows',
    'reports',
    'as of 20',
    'as of 19',
  ]
  let citationCount = 0
  for (const pattern of citationPatterns) {
    if (lower.includes(pattern)) citationCount++
  }

  // 3. Named sources: proper-noun phrases before "said"/"says"/"found"/"reported"
  const sourcePattern = /[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:said|says|found|reported|noted|concluded)/g
  const sourceCount = (text.match(sourcePattern) ?? []).length

  // 4. Concrete examples
  const examplePatterns = ['for example', 'for instance', 'such as', 'including']
  let exampleCount = 0
  for (const pattern of examplePatterns) {
    if (lower.includes(pattern)) exampleCount++
  }

  // 5. Hedge penalty: pure hedging without evidence
  const hedgePatterns = [' may ', ' might ', ' could ']
  let hedgeCount = 0
  for (const h of hedgePatterns) {
    // Count occurrences
    let idx = lower.indexOf(h)
    while (idx !== -1) {
      hedgeCount++
      idx = lower.indexOf(h, idx + 1)
    }
  }
  // Only penalize hedges when evidence signals are weak
  const evidenceSignals = specificNumberCount + citationCount + sourceCount + exampleCount
  const hedgePenalty = evidenceSignals === 0 ? Math.min(hedgeCount * 0.05, 0.3) : 0

  // Score based on evidence density
  const totalEvidence = specificNumberCount * 2 + citationCount * 2 + sourceCount * 3 + exampleCount
  const density = stats.sentences > 0 ? totalEvidence / stats.sentences : 0
  const rawScore = Math.max(Math.min(density / 0.5, 1) - hedgePenalty, 0)
  const score = Math.round(rawScore * 100)
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  if (specificNumberCount > 0 || citationCount > 0) {
    findings.push(`Found ${specificNumberCount} specific statistic${specificNumberCount !== 1 ? 's' : ''} and ${citationCount} citation signal${citationCount !== 1 ? 's' : ''}.`)
  }
  if (sourceCount > 0 || exampleCount > 0) {
    findings.push(`Detected ${sourceCount} named source${sourceCount !== 1 ? 's' : ''} and ${exampleCount} concrete example marker${exampleCount !== 1 ? 's' : ''}.`)
  }
  if (findings.length === 0) {
    if (hedgeCount > 0) {
      findings.push(`No evidence signals detected; found ${hedgeCount} hedging word${hedgeCount > 1 ? 's' : ''} (may/might/could) without supporting evidence.`)
    } else {
      findings.push('No specific statistics, citations, named sources, or example markers detected.')
    }
  }

  const recommendation =
    score < 70
      ? 'Add supporting evidence: cite studies, include percentages or measurements, name sources, and use "for example" to ground claims.'
      : undefined

  return { id: 'evidence-quality', name: 'Evidence & Citations', score, weight, level, findings, recommendation }
}
