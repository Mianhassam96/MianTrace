/**
 * topicCoverage.ts
 * Measures topic completeness through vocabulary breadth and semantic variety.
 * Weight: 20
 */

import type { VisibilityDimension } from '../../types'
import type { FullStatistics } from '../statistics'

/** Strip common English suffixes to approximate word roots */
function stemWord(word: string): string {
  return word
    .replace(/(?:ing|tion|tions|ed|ly|ness|ment|ful|less|ous|ive|al)$/, '')
}

export function analyzeTopicCoverage(
  stats: FullStatistics,
  _text: string,
  headings?: string[]
): VisibilityDimension {
  const weight = 20

  if (stats.words < 20) {
    return {
      id: 'topic-coverage',
      name: 'Topic Coverage',
      score: 0,
      weight,
      level: 'low',
      findings: ['Not enough text to measure topic coverage.'],
      recommendation: 'Expand the content to cover the topic more completely.',
    }
  }

  // 1. Vocabulary breadth from stats (type-token ratio)
  const vocabScore = Math.min(stats.vocabularyDiversity / 0.6, 1)

  // 2. Heading variety: unique words across all headings
  let headingScore = 0.5 // neutral if no headings
  if (headings && headings.length > 0) {
    const headingWords = headings
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 2)
    const uniqueHeadingWords = new Set(headingWords).size
    headingScore = Math.min(uniqueHeadingWords / 15, 1)
  }

  // 3. Semantic breadth: distinct word roots (stemmed unique words)
  const stemmedWords = stats.wordList.map(stemWord).filter(w => w.length > 3)
  const uniqueStems = new Set(stemmedWords).size
  const semanticScore = Math.min(uniqueStems / (stats.words * 0.4), 1)

  const rawScore = vocabScore * 0.4 + headingScore * 0.25 + semanticScore * 0.35
  const score = Math.round(Math.min(rawScore * 100, 100))
  const level: VisibilityDimension['level'] = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'

  const uniqueWordCount = Math.round(stats.vocabularyDiversity * stats.words)
  const findings: string[] = [
    `Vocabulary diversity is ${Math.round(stats.vocabularyDiversity * 100)}% (${uniqueWordCount} unique words out of ${stats.words} total).`,
  ]

  if (headings && headings.length > 0) {
    const headingWords = headings.join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const uniqueHW = new Set(headingWords).size
    findings.push(`${headings.length} heading${headings.length > 1 ? 's' : ''} with ${uniqueHW} distinct words provide${headings.length === 1 ? 's' : ''} structural coverage signals.`)
  }

  if (uniqueStems > 0) {
    findings.push(`Approximately ${uniqueStems} distinct word roots detected, indicating semantic breadth.`)
  }

  const recommendation =
    score < 70
      ? 'Broaden topic coverage by using varied terminology, adding subheadings, and covering related subtopics.'
      : undefined

  return { id: 'topic-coverage', name: 'Topic Coverage', score, weight, level, findings, recommendation }
}
