/**
 * entityCoverage.ts
 * Measures entity and fact density in the text.
 * Weight: 15
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

export function analyzeEntityCoverage(
  stats: FullStatistics,
  text: string,
  _headings?: string[]
): VisibilityDimension {
  const weight = 15

  if (stats.words < 20) {
    return {
      id: 'entity-coverage',
      name: 'Entity & Fact Density',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to measure entity density.'],
      recommendation: 'Include specific names, dates, numbers, and named concepts to improve entity density.',
    }
  }

  // Build set of sentence-start words (these are NOT proper nouns in our context)
  const sentenceStartWords = new Set(
    stats.sentenceList
      .map(s => {
        const m = s.match(/^\s*([A-Za-z]+)/)
        return m ? m[1].toLowerCase() : ''
      })
      .filter(w => w.length > 0)
  )

  // 1. Proper nouns: capitalized words that are NOT the first word of a sentence
  const wordTokens = text.match(/\b[A-Z][a-z]{1,}\b/g) ?? []
  const properNouns = wordTokens.filter(w => !sentenceStartWords.has(w.toLowerCase()))
  const properNounCount = properNouns.length

  // 2. Numbers
  const numberCount = (text.match(/\d+/g) ?? []).length

  // 3. Dates: year patterns (19xx/20xx) or month names
  const monthNames = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/g
  const yearPattern = /\b(?:19|20)\d{2}\b/g
  const dateCount = (text.match(monthNames) ?? []).length + (text.match(yearPattern) ?? []).length

  // 4. Named concepts: words 6+ chars that appear capitalized mid-sentence
  // (already captured in properNouns with length filter)
  const namedConceptCount = properNouns.filter(w => w.length >= 6).length

  const totalEntities = properNounCount + numberCount + dateCount + namedConceptCount
  const density = stats.words > 0 ? totalEntities / stats.words : 0

  // density >= 0.08 scores 100; 0 scores 0
  const score = Math.round(Math.min(density / 0.08, 1) * 100)
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  findings.push(`Entity density is ${(density * 100).toFixed(1)}% (${totalEntities} entities per ${stats.words} words).`)
  if (properNounCount > 0) {
    findings.push(`Detected ${properNounCount} proper noun${properNounCount > 1 ? 's' : ''} and ${numberCount} numeric value${numberCount !== 1 ? 's' : ''}.`)
  }
  if (dateCount > 0) {
    findings.push(`Found ${dateCount} date or year reference${dateCount > 1 ? 's' : ''}.`)
  }

  const recommendation =
    score < 70
      ? 'Add specific entities: named people, organizations, places, dates, and numeric facts to improve entity density.'
      : undefined

  return { id: 'entity-coverage', name: 'Entity & Fact Density', score, weight, level, findings, recommendation }
}
