/**
 * structureAnalysis.ts
 * Evaluates content structure for AI visibility.
 * Weight: 15
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

export function analyzeStructure(
  stats: FullStatistics,
  text: string,
  headings?: string[]
): VisibilityDimension {
  const weight = 15

  if (stats.words < 20) {
    return {
      id: 'content-structure',
      name: 'Content Structure',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to evaluate content structure.'],
      recommendation: 'Organize content into multiple paragraphs with lists and clear headings.',
    }
  }

  // 1. Paragraph count: 3+ paragraphs is good
  const paragraphScore = Math.min(stats.paragraphs / 4, 1)

  // 2. List-like patterns
  const lines = text.split(/\n/)
  const listPattern = /^\s*(?:\d+[.)]\s+|[-*•]\s+)/
  const listLineCount = lines.filter(l => listPattern.test(l)).length
  const listScore = Math.min(listLineCount / 4, 1)

  // 3. Sentence length variety: higher CV = better for human readability
  // sentenceLengthCV > 0.4 is good variety
  const cvScore = Math.min(stats.sentenceLengthCV / 0.4, 1)

  // 4. Heading-to-content ratio: 1 heading per 150 words is good
  let headingRatioScore = 0.4 // neutral if no headings
  if (headings && headings.length > 0 && stats.words > 0) {
    const idealHeadings = stats.words / 150
    const ratio = Math.min(headings.length / idealHeadings, 2)
    // 1.0 is ideal; penalize both too few and too many
    headingRatioScore = Math.max(0, 1 - Math.abs(ratio - 1) * 0.5)
  }

  const rawScore =
    paragraphScore * 0.35 +
    listScore * 0.2 +
    cvScore * 0.25 +
    headingRatioScore * 0.2

  const score = Math.round(Math.min(rawScore * 100, 100))
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const findings: string[] = []
  findings.push(`Content spans ${stats.paragraphs} paragraph${stats.paragraphs !== 1 ? 's' : ''} with a sentence-length CV of ${stats.sentenceLengthCV.toFixed(2)}.`)

  if (listLineCount > 0) {
    findings.push(`Found ${listLineCount} list line${listLineCount > 1 ? 's' : ''} (numbered or bulleted), aiding scannability.`)
  }

  if (headings && headings.length > 0) {
    findings.push(`${headings.length} heading${headings.length > 1 ? 's' : ''} present for a ${stats.words}-word document (ideal ratio: 1 per 150 words).`)
  }

  if (findings.length < 2 && listLineCount === 0) {
    findings.push('No list structures detected; adding bullet or numbered lists improves AI extractability.')
  }

  const recommendation =
    score < 70
      ? 'Use clear headings, varied sentence lengths, multiple paragraphs, and bullet/numbered lists to improve structural clarity.'
      : undefined

  return { id: 'content-structure', name: 'Content Structure', score, weight, level, findings, recommendation }
}
