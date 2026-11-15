/**
 * freshnessAnalysis.ts
 * Detects freshness signals in the text.
 * Weight: 5
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

const FRESHNESS_WORDS: readonly string[] = [
  'recently', 'new', 'latest', 'current', 'updated',
  'today', 'this year', 'now', 'modern', 'emerging',
]

export function analyzeFreshness(
  stats: FullStatistics,
  text: string,
  _headings?: string[]
): VisibilityDimension {
  const weight = 5

  if (stats.words < 10) {
    return {
      id: 'content-freshness',
      name: 'Content Freshness',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to evaluate freshness signals.'],
      recommendation: 'Include recent year references and temporal language to signal content currency.',
    }
  }

  const lower = text.toLowerCase()

  // 1. Year mentions: 2015–2026
  const yearMatches = text.match(/\b(202[0-6]|201[5-9])\b/g) ?? []
  const yearCount = yearMatches.length

  // 2. Temporal adverbs and freshness adjectives
  let freshWordCount = 0
  for (const word of FRESHNESS_WORDS) {
    if (lower.includes(word)) freshWordCount++
  }

  const totalFreshness = yearCount + freshWordCount
  const density = stats.sentences > 0 ? totalFreshness / stats.sentences : 0

  // density >= 0.3 scores 100; 0 scores 0
  const score = Math.round(Math.min(density / 0.3, 1) * 100)
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  if (yearCount > 0) {
    const uniqueYears = [...new Set(yearMatches)].slice(0, 3).join(', ')
    findings.push(`Found ${yearCount} year reference${yearCount > 1 ? 's' : ''} (${uniqueYears}).`)
  }
  if (freshWordCount > 0) {
    findings.push(`Found ${freshWordCount} freshness indicator${freshWordCount > 1 ? 's' : ''} (e.g., "recent", "latest", "current").`)
  }
  if (findings.length === 0) {
    findings.push('No year references or freshness indicators detected. Content may appear outdated to AI systems.')
  }

  const recommendation =
    score < 70
      ? 'Add recent year references (2020–2026) and temporal language ("latest", "current", "updated") to signal content currency.'
      : undefined

  return { id: 'content-freshness', name: 'Content Freshness', score, weight, level, findings, recommendation }
}
